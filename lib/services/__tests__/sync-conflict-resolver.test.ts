import {
  detectConflict,
  resolveConflict,
  applyConflictResolution,
  getPendingConflicts,
  resolveConflictManually,
  autoResolveOldConflicts,
  DEFAULT_CONFLICT_CONFIG,
  LessonData,
  GoogleEventData,
} from '../sync-conflict-resolver';
import { createClient } from '@/lib/supabase/server';

// Mock dependencies
jest.mock('@/lib/supabase/server', () => ({
  createClient: jest.fn(),
}));

describe('sync-conflict-resolver', () => {
  let mockSupabase: {
    from: jest.Mock;
    select: jest.Mock;
    insert: jest.Mock;
    update: jest.Mock;
    eq: jest.Mock;
    lt: jest.Mock;
    single: jest.Mock;
    order: jest.Mock;
  };

  const createMockSupabase = () => {
    const mock = {
      from: jest.fn(),
      select: jest.fn(),
      insert: jest.fn(),
      update: jest.fn(),
      eq: jest.fn(),
      lt: jest.fn(),
      single: jest.fn(),
      order: jest.fn(),
    };

    // Chain methods return the mock object itself
    mock.from.mockReturnValue(mock);
    mock.select.mockReturnValue(mock);
    mock.insert.mockReturnValue(mock);
    mock.update.mockReturnValue(mock);
    mock.eq.mockReturnValue(mock);
    mock.lt.mockReturnValue(mock);
    mock.order.mockReturnValue(mock);

    return mock;
  };

  beforeEach(() => {
    jest.clearAllMocks();
    mockSupabase = createMockSupabase();
    (createClient as jest.Mock).mockResolvedValue(mockSupabase);
  });

  describe('detectConflict', () => {
    const baseLesson: LessonData = {
      id: 'lesson-123',
      title: 'Guitar Lesson',
      scheduled_at: '2026-02-10T15:00:00Z',
      notes: 'Practice scales',
      updated_at: '2026-02-10T14:00:00Z',
      google_event_id: 'event-123',
    };

    const baseEvent: GoogleEventData = {
      id: 'event-123',
      summary: 'Guitar Lesson',
      description: 'Practice scales',
      start: { dateTime: '2026-02-10T15:00:00Z' },
      updated: '2026-02-10T14:00:00Z',
    };

    it('should return null when no conflict exists', () => {
      const conflict = detectConflict(baseLesson, baseEvent);

      expect(conflict).toBeNull();
    });

    it('should detect title conflict', () => {
      const modifiedEvent = {
        ...baseEvent,
        summary: 'Piano Lesson',
        updated: '2026-02-10T14:30:00Z',
      };

      const conflict = detectConflict(baseLesson, modifiedEvent);

      expect(conflict).not.toBeNull();
      expect(conflict?.fields.title).toEqual({
        local: 'Guitar Lesson',
        remote: 'Piano Lesson',
      });
    });

    it('should detect scheduled time conflict', () => {
      const modifiedEvent = {
        ...baseEvent,
        start: { dateTime: '2026-02-10T16:00:00Z' },
        updated: '2026-02-10T14:30:00Z',
      };

      const conflict = detectConflict(baseLesson, modifiedEvent);

      expect(conflict).not.toBeNull();
      expect(conflict?.fields.scheduled_at).toEqual({
        local: '2026-02-10T15:00:00Z',
        remote: '2026-02-10T16:00:00Z',
      });
    });

    it('should detect notes conflict', () => {
      const modifiedEvent = {
        ...baseEvent,
        description: 'Practice chords',
        updated: '2026-02-10T14:30:00Z',
      };

      const conflict = detectConflict(baseLesson, modifiedEvent);

      expect(conflict).not.toBeNull();
      expect(conflict?.fields.notes).toEqual({
        local: 'Practice scales',
        remote: 'Practice chords',
      });
    });

    it('should detect multiple field conflicts', () => {
      const modifiedEvent = {
        ...baseEvent,
        summary: 'Piano Lesson',
        description: 'Practice chords',
        start: { dateTime: '2026-02-10T16:00:00Z' },
        updated: '2026-02-10T14:30:00Z',
      };

      const conflict = detectConflict(baseLesson, modifiedEvent);

      expect(conflict).not.toBeNull();
      expect(conflict?.fields.title).toBeDefined();
      expect(conflict?.fields.scheduled_at).toBeDefined();
      expect(conflict?.fields.notes).toBeDefined();
    });

    it('should calculate time difference correctly', () => {
      const modifiedEvent = {
        ...baseEvent,
        summary: 'Modified',
        updated: '2026-02-10T14:02:00Z', // 2 minutes after lesson
      };

      const conflict = detectConflict(baseLesson, modifiedEvent);

      expect(conflict).not.toBeNull();
      expect(conflict?.timeDifferenceMs).toBe(120000); // 2 minutes in ms
    });
  });

  describe('resolveConflict', () => {
    it('should use remote when event is newer', () => {
      const conflict = {
        lessonId: 'lesson-123',
        lessonUpdated: new Date('2026-02-10T14:00:00Z'),
        eventUpdated: new Date('2026-02-10T14:30:00Z'), // 30 min newer
        timeDifferenceMs: 30 * 60 * 1000,
        fields: {
          title: { local: 'Old Title', remote: 'New Title' },
        },
      };

      const resolution = resolveConflict(conflict);

      expect(resolution).toBe('use_remote');
    });

    it('should use local when lesson is newer', () => {
      const conflict = {
        lessonId: 'lesson-123',
        lessonUpdated: new Date('2026-02-10T14:30:00Z'), // 30 min newer
        eventUpdated: new Date('2026-02-10T14:00:00Z'),
        timeDifferenceMs: 30 * 60 * 1000,
        fields: {
          title: { local: 'New Title', remote: 'Old Title' },
        },
      };

      const resolution = resolveConflict(conflict);

      expect(resolution).toBe('use_local');
    });

    it('should flag for manual review when updates are simultaneous', () => {
      const conflict = {
        lessonId: 'lesson-123',
        lessonUpdated: new Date('2026-02-10T14:00:00Z'),
        eventUpdated: new Date('2026-02-10T14:00:30Z'), // 30 seconds apart
        timeDifferenceMs: 30000, // 30 seconds
        fields: {
          title: { local: 'Title A', remote: 'Title B' },
        },
      };

      const resolution = resolveConflict(conflict, {
        ...DEFAULT_CONFLICT_CONFIG,
        simultaneousThresholdMs: 60000, // 1 minute
      });

      expect(resolution).toBe('manual_review');
    });

    it('should not flag for manual review when disabled', () => {
      const conflict = {
        lessonId: 'lesson-123',
        lessonUpdated: new Date('2026-02-10T14:00:00Z'),
        eventUpdated: new Date('2026-02-10T14:00:30Z'),
        timeDifferenceMs: 30000,
        fields: {
          title: { local: 'Title A', remote: 'Title B' },
        },
      };

      const resolution = resolveConflict(conflict, {
        simultaneousThresholdMs: 60000,
        enableManualReview: false,
      });

      // Should use last-write-wins instead
      expect(resolution).toBe('use_remote'); // Event is newer
    });
  });

  describe('applyConflictResolution', () => {
    const eventData: GoogleEventData = {
      id: 'event-123',
      summary: 'New Title',
      description: 'New notes',
      start: { dateTime: '2026-02-10T16:00:00Z' },
      updated: '2026-02-10T14:30:00Z',
    };

    beforeEach(() => {
      mockSupabase.insert.mockReturnValue(mockSupabase);
      mockSupabase.eq.mockResolvedValue({ data: {}, error: null });
    });

    it('should update local lesson when using remote data', async () => {
      // For this test, from->update->eq chain, eq returns result
      mockSupabase.eq.mockResolvedValueOnce({
        data: {},
        error: null,
      });

      await applyConflictResolution(mockSupabase as never, 'lesson-123', eventData, 'use_remote');

      expect(mockSupabase.from).toHaveBeenCalledWith('lessons');
      expect(mockSupabase.update).toHaveBeenCalledWith({
        title: 'New Title',
        scheduled_at: '2026-02-10T16:00:00Z',
        notes: 'New notes',
        updated_at: expect.any(String),
      });
      expect(mockSupabase.eq).toHaveBeenCalledWith('id', 'lesson-123');
    });

    it('should not update when using local data', async () => {
      await applyConflictResolution(mockSupabase as never, 'lesson-123', eventData, 'use_local');

      expect(mockSupabase.update).not.toHaveBeenCalled();
    });

    it('should store conflict when flagged for manual review', async () => {
      await applyConflictResolution(
        mockSupabase as never,
        'lesson-123',
        eventData,
        'manual_review'
      );

      expect(mockSupabase.from).toHaveBeenCalledWith('sync_conflicts');
      expect(mockSupabase.insert).toHaveBeenCalledWith({
        lesson_id: 'lesson-123',
        google_event_id: 'event-123',
        conflict_data: {
          remote_title: 'New Title',
          remote_scheduled_at: '2026-02-10T16:00:00Z',
          remote_notes: 'New notes',
          remote_updated: '2026-02-10T14:30:00Z',
        },
        status: 'pending',
        created_at: expect.any(String),
      });
    });
  });

  describe('getPendingConflicts', () => {
    it('should fetch pending conflicts for user', async () => {
      const mockConflicts = [
        {
          id: 'conflict-1',
          lesson_id: 'lesson-1',
          conflict_data: { remote_title: 'Title' },
          created_at: '2026-02-10T14:00:00Z',
        },
      ];

      mockSupabase.order.mockResolvedValue({
        data: mockConflicts,
        error: null,
      });

      const conflicts = await getPendingConflicts(mockSupabase as never, 'user-123');

      expect(conflicts).toEqual(mockConflicts);
      expect(mockSupabase.from).toHaveBeenCalledWith('sync_conflicts');
      expect(mockSupabase.eq).toHaveBeenCalledWith('status', 'pending');
      expect(mockSupabase.eq).toHaveBeenCalledWith('lesson.teacher_id', 'user-123');
    });

    it('should return empty array on error', async () => {
      mockSupabase.order.mockResolvedValue({
        data: null,
        error: { message: 'Database error' },
      });

      const conflicts = await getPendingConflicts(mockSupabase as never, 'user-123');

      expect(conflicts).toEqual([]);
    });
  });

  describe('resolveConflictManually', () => {
    const mockConflict = {
      id: 'conflict-1',
      lesson_id: 'lesson-1',
      conflict_data: {
        remote_title: 'Remote Title',
        remote_scheduled_at: '2026-02-10T16:00:00Z',
        remote_notes: 'Remote notes',
      },
    };

    beforeEach(() => {
      // For the select chain: from->select->eq->single
      mockSupabase.single.mockResolvedValue({
        data: mockConflict,
        error: null,
      });
    });

    it('should apply remote changes when using remote', async () => {
      // Handle multiple chains:
      // 1. from->select->eq->single (fetch conflict)
      // 2. from->update->eq (update lesson)
      // 3. from->update->eq (mark conflict resolved)

      let eqCallCount = 0;
      mockSupabase.eq.mockImplementation(() => {
        eqCallCount++;
        if (eqCallCount === 1) {
          // First eq: select chain, return mock for single()
          return mockSupabase;
        } else {
          // Subsequent eq calls: update chains, return result
          return Promise.resolve({ data: {}, error: null });
        }
      });

      const result = await resolveConflictManually(
        mockSupabase as never,
        'conflict-1',
        'use_remote'
      );

      expect(result.success).toBe(true);

      // Should update lesson with remote data
      const updateCalls = mockSupabase.update.mock.calls;
      expect(updateCalls).toContainEqual([
        {
          title: 'Remote Title',
          scheduled_at: '2026-02-10T16:00:00Z',
          notes: 'Remote notes',
        },
      ]);

      // Should mark conflict as resolved
      expect(updateCalls).toContainEqual([
        {
          status: 'resolved',
          resolution: 'use_remote',
          resolved_at: expect.any(String),
        },
      ]);
    });

    it('should only mark as resolved when using local', async () => {
      // Two chains:
      // 1. from->select->eq->single (fetch conflict)
      // 2. from->update->eq (mark resolved)

      let eqCallCount = 0;
      mockSupabase.eq.mockImplementation(() => {
        eqCallCount++;
        if (eqCallCount === 1) {
          // First eq: select chain, return mock for single()
          return mockSupabase;
        } else {
          // Second eq: update chain, return result
          return Promise.resolve({ data: {}, error: null });
        }
      });

      const result = await resolveConflictManually(
        mockSupabase as never,
        'conflict-1',
        'use_local'
      );

      expect(result.success).toBe(true);

      // Should only update conflict status (not lesson)
      const updateCalls = mockSupabase.update.mock.calls;
      expect(updateCalls.length).toBe(1);
      expect(updateCalls[0][0]).toEqual({
        status: 'resolved',
        resolution: 'use_local',
        resolved_at: expect.any(String),
      });
    });

    it('should return error when conflict not found', async () => {
      mockSupabase.single.mockResolvedValue({
        data: null,
        error: { message: 'Not found' },
      });

      const result = await resolveConflictManually(
        mockSupabase as never,
        'conflict-1',
        'use_local'
      );

      expect(result.success).toBe(false);
      expect(result.error).toBe('Conflict not found');
    });
  });

  describe('autoResolveOldConflicts', () => {
    it('should resolve conflicts older than 7 days', async () => {
      const oldConflicts = [
        { id: 'conflict-1' },
        { id: 'conflict-2' },
      ];

      // First query: from->select->eq->lt (get old conflicts)
      mockSupabase.lt.mockResolvedValueOnce({
        data: oldConflicts,
        error: null,
      });

      // For each of 2 conflicts, resolveConflictManually is called:
      // - from->select->eq->single (fetch conflict) - eq returns mock
      // - from->update->eq (mark resolved) - eq returns result
      mockSupabase.single.mockResolvedValue({
        data: { id: 'conflict-1', lesson_id: 'lesson-1', conflict_data: {} },
        error: null,
      });

      // Setup eq for complex call sequence:
      // Call 1: from->select->eq->lt (list old conflicts) - return mock
      // Call 2: from->select->eq->single (fetch conflict 1) - return mock
      // Call 3: from->update->eq (resolve conflict 1) - return result
      // Call 4: from->select->eq->single (fetch conflict 2) - return mock
      // Call 5: from->update->eq (resolve conflict 2) - return result
      const eqSequence = [
        mockSupabase, // 1: list query
        mockSupabase, // 2: fetch conflict 1
        Promise.resolve({ data: {}, error: null }), // 3: resolve conflict 1
        mockSupabase, // 4: fetch conflict 2
        Promise.resolve({ data: {}, error: null }), // 5: resolve conflict 2
      ];

      let eqCallIndex = 0;
      mockSupabase.eq.mockImplementation(() => {
        const result = eqSequence[eqCallIndex] || mockSupabase;
        eqCallIndex++;
        return result;
      });

      const result = await autoResolveOldConflicts(mockSupabase as never);

      expect(result.resolved).toBe(2);
      expect(result.failed).toBe(0);

      expect(mockSupabase.lt).toHaveBeenCalledWith('created_at', expect.any(String));
    });

    it('should return zero when no old conflicts exist', async () => {
      mockSupabase.lt.mockResolvedValue({
        data: [],
        error: null,
      });

      const result = await autoResolveOldConflicts(mockSupabase as never);

      expect(result.resolved).toBe(0);
      expect(result.failed).toBe(0);
    });
  });
});
