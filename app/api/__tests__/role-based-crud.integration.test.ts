/**
 * Integration tests: Cross-API role-based CRUD access control
 *
 * Verifies that all three roles (admin, teacher, student) get consistent
 * access control enforcement across songs, lessons, and assignments APIs.
 */

jest.mock('@/lib/services/calendar-lesson-sync', () => ({
  syncLessonCreation: jest.fn().mockResolvedValue(undefined),
  syncLessonUpdate: jest.fn().mockResolvedValue(undefined),
  syncLessonDeletion: jest.fn().mockResolvedValue(undefined),
}));

jest.mock('@/lib/services/notification-service', () => ({
  queueNotification: jest.fn().mockResolvedValue(undefined),
}));

import {
  createMockQueryBuilder,
  createMockAuthContext,
  MOCK_DATA_IDS,
} from '@/lib/testing/integration-helpers';

import {
  getSongsHandler,
  createSongHandler,
  updateSongHandler,
  deleteSongHandler,
} from '@/app/api/song/handlers';

import {
  getLessonsHandler,
  createLessonHandler,
  deleteLessonHandler,
} from '@/app/api/lessons/handlers';

import {
  createAssignmentHandler,
} from '@/app/api/assignments/handlers';

import {
  deleteAssignmentHandler,
} from '@/app/api/assignments/[id]/handlers';

/* ---------- Constants ---------- */
const adminCtx = createMockAuthContext('admin');
const teacherCtx = createMockAuthContext('teacher');
const studentCtx = createMockAuthContext('student');

const VALID_SONG = {
  title: 'Test Song',
  author: 'Test Author',
  level: 'beginner' as const,
  key: 'C' as const,
};

const VALID_LESSON = {
  student_id: studentCtx.userId,
  teacher_id: teacherCtx.userId,
  title: 'Test Lesson',
  scheduled_at: '2026-03-15T14:00:00.000Z',
  date: '2026-03-15',
  start_time: '14:00',
};

const VALID_ASSIGNMENT = {
  title: 'Practice chords',
  teacher_id: teacherCtx.userId,
  student_id: studentCtx.userId,
};

/* ========================================================== */
describe('Cross-API role-based access control', () => {
  /* -------------------------------------------------------- */
  describe('Unauthenticated access (null user)', () => {
    it('all read endpoints return 401', async () => {
      const qb = createMockQueryBuilder([]);
      const supabase = { from: jest.fn(() => qb) };

      const [songsResult, lessonsResult] = await Promise.all([
        getSongsHandler(supabase as never, null, null, {}),
        getLessonsHandler(supabase as never, null, null, {}),
      ]);

      expect(songsResult.status).toBe(401);
      expect(lessonsResult.status).toBe(401);
    });

    it('all create endpoints return 401', async () => {
      const qb = createMockQueryBuilder([]);
      const supabase = {
        from: jest.fn(() => qb),
        rpc: jest.fn(),
      };

      const [songResult, lessonResult] = await Promise.all([
        createSongHandler(supabase as never, null, null, VALID_SONG),
        createLessonHandler(supabase as never, null, null, VALID_LESSON),
      ]);

      expect(songResult.status).toBe(401);
      expect(lessonResult.status).toBe(401);
    });

    it('all delete endpoints return 401', async () => {
      const supabase = {
        from: jest.fn(() => createMockQueryBuilder([])),
        rpc: jest.fn(),
      };

      const [songResult, lessonResult] = await Promise.all([
        deleteSongHandler(supabase as never, null, null, MOCK_DATA_IDS.song),
        deleteLessonHandler(supabase as never, null, null, MOCK_DATA_IDS.lesson),
      ]);

      expect(songResult.status).toBe(401);
      expect(lessonResult.status).toBe(401);
    });
  });

  /* -------------------------------------------------------- */
  describe('Student role restrictions', () => {
    it('student can read songs but cannot create', async () => {
      const qb = createMockQueryBuilder([{ id: '1', title: 'Song' }]);
      const supabase = { from: jest.fn(() => qb) };

      const readResult = await getSongsHandler(
        supabase as never,
        studentCtx.user,
        studentCtx.profileMapped,
        {}
      );

      const createResult = await createSongHandler(
        supabase as never,
        studentCtx.user,
        studentCtx.profileMapped,
        VALID_SONG
      );

      expect(readResult.status).toBe(200);
      expect(createResult.status).toBe(403);
    });

    it('student cannot update or delete songs', async () => {
      const supabase = {
        from: jest.fn(() => createMockQueryBuilder([])),
        rpc: jest.fn(),
      };

      const updateResult = await updateSongHandler(
        supabase as never,
        studentCtx.user,
        studentCtx.profileMapped,
        MOCK_DATA_IDS.song,
        VALID_SONG
      );

      const deleteResult = await deleteSongHandler(
        supabase as never,
        studentCtx.user,
        studentCtx.profileMapped,
        MOCK_DATA_IDS.song
      );

      expect(updateResult.status).toBe(403);
      expect(deleteResult.status).toBe(403);
    });

    it('student cannot create lessons', async () => {
      const supabase = { from: jest.fn() };

      const result = await createLessonHandler(
        supabase as never,
        studentCtx.user,
        studentCtx.profileMapped,
        VALID_LESSON
      );

      expect(result.status).toBe(403);
    });

    it('student cannot delete lessons', async () => {
      const supabase = { from: jest.fn() };

      const result = await deleteLessonHandler(
        supabase as never,
        studentCtx.user,
        studentCtx.profileMapped,
        MOCK_DATA_IDS.lesson
      );

      expect(result.status).toBe(403);
    });

    it('student cannot create assignments', async () => {
      const qb = createMockQueryBuilder([]);
      const supabase = { from: jest.fn(() => qb) };

      const result = await createAssignmentHandler(
        supabase as never,
        studentCtx.userId,
        studentCtx.profileMapped,
        VALID_ASSIGNMENT
      );

      expect(result.status).toBe(403);
    });
  });

  /* -------------------------------------------------------- */
  describe('Teacher role permissions', () => {
    it('teacher can create songs', async () => {
      const qb = createMockQueryBuilder({ id: '1', ...VALID_SONG });
      const supabase = { from: jest.fn(() => qb) };

      const result = await createSongHandler(
        supabase as never,
        teacherCtx.user,
        teacherCtx.profileMapped,
        VALID_SONG
      );

      expect(result.status).toBe(201);
    });

    it('teacher can update songs', async () => {
      const qb = createMockQueryBuilder({ id: '1', ...VALID_SONG, title: 'Updated' });
      const supabase = { from: jest.fn(() => qb) };

      const result = await updateSongHandler(
        supabase as never,
        teacherCtx.user,
        teacherCtx.profileMapped,
        MOCK_DATA_IDS.song,
        VALID_SONG
      );

      expect(result.status).toBe(200);
    });

    it('teacher can delete songs', async () => {
      const rpcResult = {
        success: true,
        lesson_assignments_removed: 0,
        favorite_assignments_removed: 0,
      };
      const supabase = {
        from: jest.fn(),
        rpc: jest.fn().mockResolvedValue({ data: rpcResult, error: null }),
      };

      const result = await deleteSongHandler(
        supabase as never,
        teacherCtx.user,
        teacherCtx.profileMapped,
        MOCK_DATA_IDS.song
      );

      expect(result.status).toBe(200);
    });

    it('teacher can create assignments', async () => {
      const studentProfile = { id: studentCtx.userId, is_student: true };
      const profileBuilder = createMockQueryBuilder(studentProfile);
      const assignmentBuilder = createMockQueryBuilder({
        id: MOCK_DATA_IDS.assignment,
        ...VALID_ASSIGNMENT,
      });

      const supabase = {
        from: jest.fn((table: string) => {
          if (table === 'profiles') return profileBuilder;
          return assignmentBuilder;
        }),
      };

      const result = await createAssignmentHandler(
        supabase as never,
        teacherCtx.userId,
        teacherCtx.profileMapped,
        VALID_ASSIGNMENT
      );

      expect(result.status).toBe(201);
    });
  });

  /* -------------------------------------------------------- */
  describe('Admin role permissions', () => {
    it('admin can perform all song operations', async () => {
      const songQb = createMockQueryBuilder({ id: '1', ...VALID_SONG });
      const supabase = {
        from: jest.fn(() => songQb),
        rpc: jest.fn().mockResolvedValue({
          data: { success: true, lesson_assignments_removed: 0, favorite_assignments_removed: 0 },
          error: null,
        }),
      };

      const readResult = await getSongsHandler(
        supabase as never,
        adminCtx.user,
        adminCtx.profileMapped,
        {}
      );
      const createResult = await createSongHandler(
        supabase as never,
        adminCtx.user,
        adminCtx.profileMapped,
        VALID_SONG
      );
      const updateResult = await updateSongHandler(
        supabase as never,
        adminCtx.user,
        adminCtx.profileMapped,
        MOCK_DATA_IDS.song,
        VALID_SONG
      );
      const deleteResult = await deleteSongHandler(
        supabase as never,
        adminCtx.user,
        adminCtx.profileMapped,
        MOCK_DATA_IDS.song
      );

      expect(readResult.status).toBe(200);
      expect(createResult.status).toBe(201);
      expect(updateResult.status).toBe(200);
      expect(deleteResult.status).toBe(200);
    });

    it('admin can delete any teacher assignment', async () => {
      const existingAssignment = {
        teacher_id: teacherCtx.userId, // owned by teacher
      };

      const qb = createMockQueryBuilder(existingAssignment);
      qb.single.mockResolvedValueOnce({ data: existingAssignment, error: null });

      const supabase = { from: jest.fn(() => qb) };

      const result = await deleteAssignmentHandler(
        supabase as never,
        MOCK_DATA_IDS.assignment,
        adminCtx.userId,
        adminCtx.profileMapped
      );

      expect(result.status).toBe(200);
    });
  });
});
