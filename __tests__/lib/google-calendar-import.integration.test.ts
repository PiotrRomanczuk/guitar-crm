/**
 * Integration tests for Google Calendar Import (Journey 6)
 *
 * Tests bulk import utilities: month chunking, student resolution,
 * dedup detection, and conflict detection/resolution.
 */

import {
  generateMonthChunks,
  determineLessonStatus,
  extractStudentFromAttendees,
  findOrCreateStudent,
} from '@/lib/services/calendar-bulk-import';
import {
  detectConflict,
  resolveConflict,
  DEFAULT_CONFLICT_CONFIG,
  type LessonData,
  type GoogleEventData,
} from '@/lib/services/sync-conflict-resolver';

jest.mock('@/lib/services/import-utils', () => ({
  matchStudentByEmail: jest.fn(),
  createShadowStudent: jest.fn(),
}));

// eslint-disable-next-line @typescript-eslint/no-require-imports
const { matchStudentByEmail, createShadowStudent } = require('@/lib/services/import-utils');

describe('Google Calendar Import (Journey 6)', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  describe('generateMonthChunks', () => {
    it('splits a 3-month range into 3 chunks with correct boundaries', () => {
      const start = new Date('2025-01-15');
      const end = new Date('2025-03-20');

      const chunks = generateMonthChunks(start, end);

      expect(chunks).toHaveLength(3);

      // First chunk: Jan 1 → Jan 31
      expect(chunks[0].start.getMonth()).toBe(0); // January
      expect(chunks[0].start.getDate()).toBe(1);
      expect(chunks[0].label).toContain('Jan');

      // Second chunk: Feb 1 → Feb 28
      expect(chunks[1].start.getMonth()).toBe(1); // February
      expect(chunks[1].start.getDate()).toBe(1);
      expect(chunks[1].label).toContain('Feb');

      // Third chunk: Mar 1 → end date (Mar 20)
      expect(chunks[2].start.getMonth()).toBe(2); // March
      expect(chunks[2].end.getTime()).toBeLessThanOrEqual(end.getTime());
    });
  });

  describe('determineLessonStatus', () => {
    it('returns COMPLETED for past events, SCHEDULED for future', () => {
      const past = new Date();
      past.setDate(past.getDate() - 7);

      const future = new Date();
      future.setDate(future.getDate() + 7);

      expect(determineLessonStatus(past.toISOString())).toBe('COMPLETED');
      expect(determineLessonStatus(future.toISOString())).toBe('SCHEDULED');
    });
  });

  describe('extractStudentFromAttendees', () => {
    it('returns the non-teacher attendee and strips $$$ prefix', () => {
      const attendees = [
        { email: 'teacher@school.com', displayName: 'Teacher' },
        { email: 'student@example.com', displayName: '$$$ John Doe' },
      ];

      const result = extractStudentFromAttendees(attendees, 'teacher@school.com');

      expect(result).toEqual({
        email: 'student@example.com',
        displayName: 'John Doe',
      });
    });

    it('returns null when no attendees', () => {
      expect(extractStudentFromAttendees(undefined, 'teacher@school.com')).toBeNull();
      expect(extractStudentFromAttendees([], 'teacher@school.com')).toBeNull();
    });
  });

  describe('findOrCreateStudent', () => {
    it('returns profileId for a matched student', async () => {
      matchStudentByEmail.mockResolvedValue({
        status: 'MATCHED',
        candidates: [{ id: 'profile-123', email: 'student@example.com' }],
      });

      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      const result = await findOrCreateStudent({} as any, 'student@example.com', 'John Doe');

      expect(result).toEqual({ profileId: 'profile-123' });
      expect(createShadowStudent).not.toHaveBeenCalled();
    });

    it('creates a shadow student when no match found', async () => {
      matchStudentByEmail.mockResolvedValue({
        status: 'NONE',
        candidates: [],
      });
      createShadowStudent.mockResolvedValue({
        success: true,
        profileId: 'new-profile-456',
      });

      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      const result = await findOrCreateStudent({} as any, 'new@example.com', 'Jane Smith');

      expect(createShadowStudent).toHaveBeenCalledWith('new@example.com', 'Jane', 'Smith');
      expect(result).toEqual({ profileId: 'new-profile-456' });
    });

    it('returns error for ambiguous match', async () => {
      matchStudentByEmail.mockResolvedValue({
        status: 'AMBIGUOUS',
        candidates: [{ id: '1' }, { id: '2' }],
      });

      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      const result = await findOrCreateStudent({} as any, 'ambiguous@example.com', 'Test');

      expect(result).toHaveProperty('error');
      expect((result as { error: string }).error).toContain('Ambiguous');
    });
  });

  describe('detectConflict', () => {
    const baseLessonData: LessonData = {
      id: 'lesson-1',
      title: 'Guitar Lesson',
      scheduled_at: '2025-03-01T10:00:00Z',
      notes: 'Practice scales',
      updated_at: '2025-03-01T08:00:00Z',
    };

    const baseEventData: GoogleEventData = {
      id: 'event-1',
      summary: 'Guitar Lesson',
      description: 'Practice scales',
      start: { dateTime: '2025-03-01T10:00:00Z' },
      updated: '2025-03-01T08:00:00Z',
    };

    it('returns null when local and remote are identical', () => {
      const result = detectConflict(baseLessonData, baseEventData);
      expect(result).toBeNull();
    });

    it('returns ConflictInfo with fields.title when title differs', () => {
      const modifiedEvent: GoogleEventData = {
        ...baseEventData,
        summary: 'Updated Lesson Title',
        updated: '2025-03-01T09:00:00Z',
      };

      const result = detectConflict(baseLessonData, modifiedEvent);

      expect(result).not.toBeNull();
      expect(result!.fields.title).toEqual({
        local: 'Guitar Lesson',
        remote: 'Updated Lesson Title',
      });
      expect(result!.lessonId).toBe('lesson-1');
    });
  });

  describe('resolveConflict', () => {
    it('returns use_remote when event is newer than lesson', () => {
      const conflict = {
        lessonId: 'lesson-1',
        lessonUpdated: new Date('2025-03-01T08:00:00Z'),
        eventUpdated: new Date('2025-03-01T10:00:00Z'),
        timeDifferenceMs: 2 * 60 * 60 * 1000, // 2 hours apart
        fields: { title: { local: 'Old', remote: 'New' } },
      };

      expect(resolveConflict(conflict, DEFAULT_CONFLICT_CONFIG)).toBe('use_remote');
    });

    it('returns use_local when lesson is newer than event', () => {
      const conflict = {
        lessonId: 'lesson-1',
        lessonUpdated: new Date('2025-03-01T10:00:00Z'),
        eventUpdated: new Date('2025-03-01T08:00:00Z'),
        timeDifferenceMs: 2 * 60 * 60 * 1000,
        fields: { title: { local: 'New', remote: 'Old' } },
      };

      expect(resolveConflict(conflict, DEFAULT_CONFLICT_CONFIG)).toBe('use_local');
    });

    it('returns manual_review when updates are within simultaneous threshold', () => {
      const conflict = {
        lessonId: 'lesson-1',
        lessonUpdated: new Date('2025-03-01T10:00:00Z'),
        eventUpdated: new Date('2025-03-01T10:00:30Z'),
        timeDifferenceMs: 30_000, // 30 seconds — within default 60s threshold
        fields: { title: { local: 'A', remote: 'B' } },
      };

      expect(resolveConflict(conflict, DEFAULT_CONFLICT_CONFIG)).toBe('manual_review');
    });
  });
});
