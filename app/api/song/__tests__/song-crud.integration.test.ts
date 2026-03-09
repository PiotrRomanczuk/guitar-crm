/**
 * Integration tests: full Song CRUD flow
 *
 * Exercises every exported handler from the songs API through
 * create, read, update, and delete scenarios with role-based access control.
 */
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
  validateMutationPermission,
} from '@/app/api/song/handlers';

/* ---------- Constants ---------- */
const adminCtx = createMockAuthContext('admin');
const teacherCtx = createMockAuthContext('teacher');
const studentCtx = createMockAuthContext('student');

const SAMPLE_SONG = {
  id: MOCK_DATA_IDS.song,
  title: 'Wonderwall',
  author: 'Oasis',
  level: 'Intermediate',
  key: 'F#m',
  url: 'https://example.com/wonderwall',
  deleted_at: null,
  created_at: '2026-01-15T10:00:00.000Z',
  updated_at: '2026-01-15T10:00:00.000Z',
};

const VALID_SONG_INPUT = {
  title: 'Wonderwall',
  author: 'Oasis',
  level: 'intermediate' as const,
  key: 'C' as const,
};

/* ========================================================== */
describe('Song CRUD integration', () => {
  /* -------------------------------------------------------- */
  describe('validateMutationPermission', () => {
    it('returns true for admin', () => {
      expect(validateMutationPermission(adminCtx.profileMapped)).toBe(true);
    });

    it('returns true for teacher', () => {
      expect(validateMutationPermission(teacherCtx.profileMapped)).toBe(true);
    });

    it('returns false for student', () => {
      expect(validateMutationPermission(studentCtx.profileMapped)).toBe(false);
    });

    it('returns false for null profile', () => {
      expect(validateMutationPermission(null)).toBe(false);
    });
  });

  /* -------------------------------------------------------- */
  describe('GET /api/song (list)', () => {
    it('admin can list all songs', async () => {
      const songs = [SAMPLE_SONG];
      const qb = createMockQueryBuilder(songs, null, 1);
      const supabase = { from: jest.fn(() => qb) };

      const result = await getSongsHandler(
        supabase as never,
        adminCtx.user,
        adminCtx.profileMapped,
        {}
      );

      expect(result.status).toBe(200);
      expect('songs' in result && result.songs).toEqual(songs);
      expect(supabase.from).toHaveBeenCalledWith('songs');
    });

    it('returns empty array when no songs exist', async () => {
      const qb = createMockQueryBuilder([], null, 0);
      const supabase = { from: jest.fn(() => qb) };

      const result = await getSongsHandler(
        supabase as never,
        adminCtx.user,
        adminCtx.profileMapped,
        {}
      );

      expect(result.status).toBe(200);
      expect('songs' in result && result.songs).toEqual([]);
    });

    it('returns 401 when user is null', async () => {
      const qb = createMockQueryBuilder([]);
      const supabase = { from: jest.fn(() => qb) };

      const result = await getSongsHandler(
        supabase as never,
        null,
        null,
        {}
      );

      expect(result.status).toBe(401);
      expect('error' in result && result.error).toBe('Unauthorized');
    });

    it('applies level filter', async () => {
      const qb = createMockQueryBuilder([SAMPLE_SONG]);
      const supabase = { from: jest.fn(() => qb) };

      await getSongsHandler(
        supabase as never,
        adminCtx.user,
        adminCtx.profileMapped,
        { level: 'Intermediate' }
      );

      expect(qb.eq).toHaveBeenCalledWith('level', 'Intermediate');
    });

    it('applies search filter via ilike', async () => {
      const qb = createMockQueryBuilder([SAMPLE_SONG]);
      const supabase = { from: jest.fn(() => qb) };

      await getSongsHandler(
        supabase as never,
        adminCtx.user,
        adminCtx.profileMapped,
        { search: 'Wonder' }
      );

      expect(qb.ilike).toHaveBeenCalledWith('title', '%Wonder%');
    });

    it('applies key and author filters', async () => {
      const qb = createMockQueryBuilder([SAMPLE_SONG]);
      const supabase = { from: jest.fn(() => qb) };

      await getSongsHandler(
        supabase as never,
        adminCtx.user,
        adminCtx.profileMapped,
        { key: 'F#m', author: 'Oasis' }
      );

      expect(qb.eq).toHaveBeenCalledWith('key', 'F#m');
      expect(qb.eq).toHaveBeenCalledWith('author', 'Oasis');
    });

    it('applies pagination with page and limit', async () => {
      const qb = createMockQueryBuilder([SAMPLE_SONG]);
      const supabase = { from: jest.fn(() => qb) };

      await getSongsHandler(
        supabase as never,
        adminCtx.user,
        adminCtx.profileMapped,
        { page: 2, limit: 10 }
      );

      // offset = (2-1) * 10 = 10, range(10, 19)
      expect(qb.range).toHaveBeenCalledWith(10, 19);
    });

    it('applies sort order', async () => {
      const qb = createMockQueryBuilder([SAMPLE_SONG]);
      const supabase = { from: jest.fn(() => qb) };

      await getSongsHandler(
        supabase as never,
        adminCtx.user,
        adminCtx.profileMapped,
        { sortBy: 'title', sortOrder: 'asc' }
      );

      expect(qb.order).toHaveBeenCalledWith('title', { ascending: true });
    });

    it('falls back to created_at for invalid sort field', async () => {
      const qb = createMockQueryBuilder([SAMPLE_SONG]);
      const supabase = { from: jest.fn(() => qb) };

      await getSongsHandler(
        supabase as never,
        adminCtx.user,
        adminCtx.profileMapped,
        { sortBy: 'malicious_field' }
      );

      expect(qb.order).toHaveBeenCalledWith('created_at', { ascending: false });
    });

    it('filters out soft-deleted songs', async () => {
      const qb = createMockQueryBuilder([SAMPLE_SONG]);
      const supabase = { from: jest.fn(() => qb) };

      await getSongsHandler(
        supabase as never,
        adminCtx.user,
        adminCtx.profileMapped,
        {}
      );

      expect(qb.is).toHaveBeenCalledWith('deleted_at', null);
    });

    it('returns 500 when database query fails', async () => {
      const qb = createMockQueryBuilder(null, { message: 'connection timeout' });
      const supabase = { from: jest.fn(() => qb) };

      const result = await getSongsHandler(
        supabase as never,
        adminCtx.user,
        adminCtx.profileMapped,
        {}
      );

      expect(result.status).toBe(500);
      expect('error' in result && result.error).toBe('connection timeout');
    });
  });

  /* -------------------------------------------------------- */
  describe('POST /api/song (create)', () => {
    it('teacher can create a song', async () => {
      const qb = createMockQueryBuilder(SAMPLE_SONG);
      const supabase = { from: jest.fn(() => qb) };

      const result = await createSongHandler(
        supabase as never,
        teacherCtx.user,
        teacherCtx.profileMapped,
        VALID_SONG_INPUT
      );

      expect(result.status).toBe(201);
      expect(result.song).toBeDefined();
      expect(result.song!.title).toBe('Wonderwall');
      expect(qb.insert).toHaveBeenCalled();
    });

    it('admin can create a song', async () => {
      const qb = createMockQueryBuilder(SAMPLE_SONG);
      const supabase = { from: jest.fn(() => qb) };

      const result = await createSongHandler(
        supabase as never,
        adminCtx.user,
        adminCtx.profileMapped,
        VALID_SONG_INPUT
      );

      expect(result.status).toBe(201);
      expect(result.song).toBeDefined();
    });

    it('student cannot create a song (403)', async () => {
      const qb = createMockQueryBuilder([]);
      const supabase = { from: jest.fn(() => qb) };

      const result = await createSongHandler(
        supabase as never,
        studentCtx.user,
        studentCtx.profileMapped,
        VALID_SONG_INPUT
      );

      expect(result.status).toBe(403);
      expect(result.error).toBe('Forbidden: Only teachers and admins can create songs');
    });

    it('returns 401 when user is null', async () => {
      const qb = createMockQueryBuilder([]);
      const supabase = { from: jest.fn(() => qb) };

      const result = await createSongHandler(
        supabase as never,
        null,
        null,
        VALID_SONG_INPUT
      );

      expect(result.status).toBe(401);
      expect(result.error).toBe('Unauthorized');
    });

    it('returns 422 for invalid song data (validation error)', async () => {
      const qb = createMockQueryBuilder([]);
      const supabase = { from: jest.fn(() => qb) };

      const invalidInput = { title: '' }; // Missing required fields

      const result = await createSongHandler(
        supabase as never,
        teacherCtx.user,
        teacherCtx.profileMapped,
        invalidInput
      );

      expect(result.status).toBe(422);
      expect(result.error).toContain('Validation failed');
    });

    it('returns 409 for duplicate song (unique constraint)', async () => {
      const qb = createMockQueryBuilder(null, { code: '23505', message: 'duplicate key' });
      const supabase = { from: jest.fn(() => qb) };

      const result = await createSongHandler(
        supabase as never,
        teacherCtx.user,
        teacherCtx.profileMapped,
        VALID_SONG_INPUT
      );

      expect(result.status).toBe(409);
      expect(result.error).toBe('A song with this title and author already exists');
    });

    it('returns 500 for database errors (non-duplicate)', async () => {
      const qb = createMockQueryBuilder(null, { code: 'XXXXX', message: 'db error' });
      const supabase = { from: jest.fn(() => qb) };

      const result = await createSongHandler(
        supabase as never,
        teacherCtx.user,
        teacherCtx.profileMapped,
        VALID_SONG_INPUT
      );

      expect(result.status).toBe(500);
      expect(result.error).toBe('db error');
    });

    it('supports draft songs with relaxed validation', async () => {
      const qb = createMockQueryBuilder({ ...SAMPLE_SONG, is_draft: true });
      const supabase = { from: jest.fn(() => qb) };

      const draftInput = {
        title: 'Draft Song',
        is_draft: true,
      };

      const result = await createSongHandler(
        supabase as never,
        teacherCtx.user,
        teacherCtx.profileMapped,
        draftInput
      );

      // Draft schema has relaxed validation
      expect(result.status).toBe(201);
    });
  });

  /* -------------------------------------------------------- */
  describe('PUT /api/song (update)', () => {
    it('teacher can update a song', async () => {
      const updatedSong = { ...SAMPLE_SONG, title: 'Updated Wonderwall' };
      const qb = createMockQueryBuilder(updatedSong);
      const supabase = { from: jest.fn(() => qb) };

      const result = await updateSongHandler(
        supabase as never,
        teacherCtx.user,
        teacherCtx.profileMapped,
        MOCK_DATA_IDS.song,
        { ...VALID_SONG_INPUT, title: 'Updated Wonderwall' }
      );

      expect(result.status).toBe(200);
      expect(result.song).toBeDefined();
      expect(result.song!.title).toBe('Updated Wonderwall');
      expect(qb.update).toHaveBeenCalled();
      expect(qb.eq).toHaveBeenCalledWith('id', MOCK_DATA_IDS.song);
    });

    it('student cannot update a song (403)', async () => {
      const qb = createMockQueryBuilder([]);
      const supabase = { from: jest.fn(() => qb) };

      const result = await updateSongHandler(
        supabase as never,
        studentCtx.user,
        studentCtx.profileMapped,
        MOCK_DATA_IDS.song,
        VALID_SONG_INPUT
      );

      expect(result.status).toBe(403);
      expect(result.error).toBe('Forbidden: Only teachers and admins can update songs');
    });

    it('returns 401 when user is null', async () => {
      const qb = createMockQueryBuilder([]);
      const supabase = { from: jest.fn(() => qb) };

      const result = await updateSongHandler(
        supabase as never,
        null,
        null,
        MOCK_DATA_IDS.song,
        VALID_SONG_INPUT
      );

      expect(result.status).toBe(401);
      expect(result.error).toBe('Unauthorized');
    });

    it('returns 422 for invalid update data', async () => {
      const qb = createMockQueryBuilder([]);
      const supabase = { from: jest.fn(() => qb) };

      const result = await updateSongHandler(
        supabase as never,
        teacherCtx.user,
        teacherCtx.profileMapped,
        MOCK_DATA_IDS.song,
        { title: '' } // Invalid
      );

      expect(result.status).toBe(422);
      expect(result.error).toContain('Validation failed');
    });

    it('returns 500 on database error', async () => {
      const qb = createMockQueryBuilder(null, { message: 'update failed' });
      const supabase = { from: jest.fn(() => qb) };

      const result = await updateSongHandler(
        supabase as never,
        teacherCtx.user,
        teacherCtx.profileMapped,
        MOCK_DATA_IDS.song,
        VALID_SONG_INPUT
      );

      expect(result.status).toBe(500);
      expect(result.error).toBe('update failed');
    });
  });

  /* -------------------------------------------------------- */
  describe('DELETE /api/song (delete)', () => {
    it('teacher can delete a song (soft delete with cascade)', async () => {
      const rpcResult = {
        success: true,
        lesson_assignments_removed: 2,
        favorite_assignments_removed: 1,
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
      expect(result.success).toBe(true);
      expect(result.cascadeInfo).toEqual({
        lessonSongsDeleted: 2,
        userFavoritesDeleted: 1,
      });
      expect(supabase.rpc).toHaveBeenCalledWith('soft_delete_song_with_cascade', {
        song_uuid: MOCK_DATA_IDS.song,
        user_uuid: teacherCtx.user.id,
      });
    });

    it('admin can delete a song', async () => {
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
        adminCtx.user,
        adminCtx.profileMapped,
        MOCK_DATA_IDS.song
      );

      expect(result.status).toBe(200);
      expect(result.success).toBe(true);
    });

    it('student cannot delete a song (403)', async () => {
      const supabase = {
        from: jest.fn(),
        rpc: jest.fn(),
      };

      const result = await deleteSongHandler(
        supabase as never,
        studentCtx.user,
        studentCtx.profileMapped,
        MOCK_DATA_IDS.song
      );

      expect(result.status).toBe(403);
      expect(result.error).toBe('Forbidden: Only teachers and admins can delete songs');
      expect(supabase.rpc).not.toHaveBeenCalled();
    });

    it('returns 401 when user is null', async () => {
      const supabase = {
        from: jest.fn(),
        rpc: jest.fn(),
      };

      const result = await deleteSongHandler(
        supabase as never,
        null,
        null,
        MOCK_DATA_IDS.song
      );

      expect(result.status).toBe(401);
    });

    it('returns 500 when RPC fails', async () => {
      const supabase = {
        from: jest.fn(),
        rpc: jest.fn().mockResolvedValue({
          data: null,
          error: { message: 'rpc error' },
        }),
      };

      const result = await deleteSongHandler(
        supabase as never,
        teacherCtx.user,
        teacherCtx.profileMapped,
        MOCK_DATA_IDS.song
      );

      expect(result.status).toBe(500);
      expect(result.error).toBe('rpc error');
    });

    it('returns 400 when RPC returns success: false', async () => {
      const supabase = {
        from: jest.fn(),
        rpc: jest.fn().mockResolvedValue({
          data: { success: false, error: 'Song not found' },
          error: null,
        }),
      };

      const result = await deleteSongHandler(
        supabase as never,
        teacherCtx.user,
        teacherCtx.profileMapped,
        MOCK_DATA_IDS.song
      );

      expect(result.status).toBe(400);
      expect(result.error).toBe('Song not found');
    });
  });
});
