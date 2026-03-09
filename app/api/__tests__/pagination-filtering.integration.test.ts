/**
 * Integration tests: API pagination, filtering, and sorting
 *
 * Verifies that query parameter handling works correctly across
 * the songs and lessons APIs — pagination offsets, sort field
 * validation, filter application, and default values.
 */

jest.mock('@/lib/services/calendar-lesson-sync', () => ({
  syncLessonCreation: jest.fn().mockResolvedValue(undefined),
  syncLessonUpdate: jest.fn().mockResolvedValue(undefined),
  syncLessonDeletion: jest.fn().mockResolvedValue(undefined),
}));

import {
  createMockQueryBuilder,
  createMockAuthContext,
} from '@/lib/testing/integration-helpers';

import { getSongsHandler } from '@/app/api/song/handlers';
import { getLessonsHandler } from '@/app/api/lessons/handlers';

/* ---------- Constants ---------- */
const adminCtx = createMockAuthContext('admin');

function makeSongs(count: number) {
  return Array.from({ length: count }, (_, i) => ({
    id: `song-${i + 1}`,
    title: `Song ${i + 1}`,
    author: `Author ${i + 1}`,
    deleted_at: null,
  }));
}

function makeLessons(count: number) {
  return Array.from({ length: count }, (_, i) => ({
    id: `lesson-${i + 1}`,
    title: `Lesson ${i + 1}`,
    student_id: adminCtx.userId,
    teacher_id: adminCtx.userId,
    status: 'SCHEDULED',
    deleted_at: null,
    scheduled_at: `2026-03-${String(i + 1).padStart(2, '0')}T10:00:00Z`,
  }));
}

/* ========================================================== */
describe('API pagination and filtering', () => {
  /* -------------------------------------------------------- */
  describe('Songs pagination', () => {
    it('defaults to page 1 with limit 50', async () => {
      const songs = makeSongs(5);
      const qb = createMockQueryBuilder(songs, null, 5);
      const supabase = { from: jest.fn(() => qb) };

      const result = await getSongsHandler(
        supabase as never,
        adminCtx.user,
        adminCtx.profileMapped,
        {} // no pagination params
      );

      expect(result.status).toBe(200);
      // Default: range(0, 49)
      expect(qb.range).toHaveBeenCalledWith(0, 49);
    });

    it('calculates correct offset for page 3 with limit 10', async () => {
      const qb = createMockQueryBuilder(makeSongs(10), null, 30);
      const supabase = { from: jest.fn(() => qb) };

      await getSongsHandler(
        supabase as never,
        adminCtx.user,
        adminCtx.profileMapped,
        { page: 3, limit: 10 }
      );

      // offset = (3-1) * 10 = 20, range(20, 29)
      expect(qb.range).toHaveBeenCalledWith(20, 29);
    });

    it('calculates correct offset for page 1 with limit 25', async () => {
      const qb = createMockQueryBuilder(makeSongs(25), null, 100);
      const supabase = { from: jest.fn(() => qb) };

      await getSongsHandler(
        supabase as never,
        adminCtx.user,
        adminCtx.profileMapped,
        { page: 1, limit: 25 }
      );

      // offset = (1-1) * 25 = 0, range(0, 24)
      expect(qb.range).toHaveBeenCalledWith(0, 24);
    });

    it('returns count alongside songs for total page calculation', async () => {
      const songs = makeSongs(3);
      const qb = createMockQueryBuilder(songs, null, 50);
      const supabase = { from: jest.fn(() => qb) };

      const result = await getSongsHandler(
        supabase as never,
        adminCtx.user,
        adminCtx.profileMapped,
        {}
      );

      expect(result.status).toBe(200);
      if ('count' in result) {
        expect(result.count).toBe(50);
      }
    });
  });

  /* -------------------------------------------------------- */
  describe('Songs sorting', () => {
    it('defaults to created_at descending', async () => {
      const qb = createMockQueryBuilder(makeSongs(1));
      const supabase = { from: jest.fn(() => qb) };

      await getSongsHandler(
        supabase as never,
        adminCtx.user,
        adminCtx.profileMapped,
        {}
      );

      expect(qb.order).toHaveBeenCalledWith('created_at', { ascending: false });
    });

    it('accepts valid sort fields: title, author, level, key', async () => {
      for (const field of ['title', 'author', 'level', 'key']) {
        const qb = createMockQueryBuilder(makeSongs(1));
        const supabase = { from: jest.fn(() => qb) };

        await getSongsHandler(
          supabase as never,
          adminCtx.user,
          adminCtx.profileMapped,
          { sortBy: field, sortOrder: 'asc' }
        );

        expect(qb.order).toHaveBeenCalledWith(field, { ascending: true });
      }
    });

    it('rejects invalid sort fields by falling back to created_at', async () => {
      const qb = createMockQueryBuilder(makeSongs(1));
      const supabase = { from: jest.fn(() => qb) };

      await getSongsHandler(
        supabase as never,
        adminCtx.user,
        adminCtx.profileMapped,
        { sortBy: 'DROP TABLE songs;--' }
      );

      expect(qb.order).toHaveBeenCalledWith('created_at', { ascending: false });
    });

    it('supports ascending sort order', async () => {
      const qb = createMockQueryBuilder(makeSongs(1));
      const supabase = { from: jest.fn(() => qb) };

      await getSongsHandler(
        supabase as never,
        adminCtx.user,
        adminCtx.profileMapped,
        { sortBy: 'updated_at', sortOrder: 'asc' }
      );

      expect(qb.order).toHaveBeenCalledWith('updated_at', { ascending: true });
    });
  });

  /* -------------------------------------------------------- */
  describe('Songs filtering', () => {
    it('applies single filter correctly', async () => {
      const qb = createMockQueryBuilder(makeSongs(1));
      const supabase = { from: jest.fn(() => qb) };

      await getSongsHandler(
        supabase as never,
        adminCtx.user,
        adminCtx.profileMapped,
        { level: 'Advanced' }
      );

      expect(qb.eq).toHaveBeenCalledWith('level', 'Advanced');
    });

    it('applies multiple filters simultaneously', async () => {
      const qb = createMockQueryBuilder(makeSongs(1));
      const supabase = { from: jest.fn(() => qb) };

      await getSongsHandler(
        supabase as never,
        adminCtx.user,
        adminCtx.profileMapped,
        { level: 'Beginner', key: 'C', author: 'Beatles' }
      );

      expect(qb.eq).toHaveBeenCalledWith('level', 'Beginner');
      expect(qb.eq).toHaveBeenCalledWith('key', 'C');
      expect(qb.eq).toHaveBeenCalledWith('author', 'Beatles');
    });

    it('combines filter and search', async () => {
      const qb = createMockQueryBuilder(makeSongs(1));
      const supabase = { from: jest.fn(() => qb) };

      await getSongsHandler(
        supabase as never,
        adminCtx.user,
        adminCtx.profileMapped,
        { level: 'Intermediate', search: 'Yesterday' }
      );

      expect(qb.eq).toHaveBeenCalledWith('level', 'Intermediate');
      expect(qb.ilike).toHaveBeenCalledWith('title', '%Yesterday%');
    });

    it('always filters soft-deleted records', async () => {
      const qb = createMockQueryBuilder(makeSongs(1));
      const supabase = { from: jest.fn(() => qb) };

      await getSongsHandler(
        supabase as never,
        adminCtx.user,
        adminCtx.profileMapped,
        {}
      );

      expect(qb.is).toHaveBeenCalledWith('deleted_at', null);
    });
  });

  /* -------------------------------------------------------- */
  describe('Lessons pagination and filtering', () => {
    it('admin can list lessons with default pagination', async () => {
      const lessons = makeLessons(3);
      const qb = createMockQueryBuilder(lessons, null, 3);
      const supabase = { from: jest.fn(() => qb) };

      const result = await getLessonsHandler(
        supabase as never,
        adminCtx.user,
        adminCtx.profileMapped,
        {}
      );

      expect(result.status).toBe(200);
      expect(result.lessons).toBeDefined();
    });

    it('applies status filter', async () => {
      const qb = createMockQueryBuilder(makeLessons(1));
      const supabase = { from: jest.fn(() => qb) };

      await getLessonsHandler(
        supabase as never,
        adminCtx.user,
        adminCtx.profileMapped,
        { filter: 'completed' }
      );

      expect(qb.eq).toHaveBeenCalledWith('status', 'COMPLETED');
    });

    it('does not apply filter when value is "all"', async () => {
      const qb = createMockQueryBuilder(makeLessons(1));
      const supabase = { from: jest.fn(() => qb) };

      await getLessonsHandler(
        supabase as never,
        adminCtx.user,
        adminCtx.profileMapped,
        { filter: 'all' }
      );

      // status eq should not have been called with 'ALL'
      const statusCalls = qb.eq.mock.calls.filter(
        (call: unknown[]) => call[0] === 'status'
      );
      expect(statusCalls).toHaveLength(0);
    });

    it('validates lesson sort fields', async () => {
      const qb = createMockQueryBuilder(makeLessons(1));
      const supabase = { from: jest.fn(() => qb) };

      await getLessonsHandler(
        supabase as never,
        adminCtx.user,
        adminCtx.profileMapped,
        { sort: 'date', sortOrder: 'asc' }
      );

      expect(qb.order).toHaveBeenCalledWith('date', { ascending: true });
    });

    it('falls back to created_at for invalid lesson sort field', async () => {
      const qb = createMockQueryBuilder(makeLessons(1));
      const supabase = { from: jest.fn(() => qb) };

      await getLessonsHandler(
        supabase as never,
        adminCtx.user,
        adminCtx.profileMapped,
        { sort: 'invalid_field' as 'created_at' }
      );

      expect(qb.order).toHaveBeenCalledWith('created_at', { ascending: false });
    });

    it('teacher with no students gets empty result', async () => {
      // Return empty array for teacher's student lookup
      const qb = createMockQueryBuilder([]);
      const supabase = { from: jest.fn(() => qb) };

      const teacherCtx = createMockAuthContext('teacher');

      const result = await getLessonsHandler(
        supabase as never,
        teacherCtx.user,
        teacherCtx.profileMapped,
        {}
      );

      expect(result.status).toBe(200);
      expect(result.lessons).toEqual([]);
      expect(result.count).toBe(0);
    });

    it('returns profile not found when profile is null', async () => {
      const supabase = { from: jest.fn() };

      const result = await getLessonsHandler(
        supabase as never,
        adminCtx.user,
        null,
        {}
      );

      expect(result.status).toBe(404);
      expect(result.error).toBe('Profile not found');
    });
  });
});
