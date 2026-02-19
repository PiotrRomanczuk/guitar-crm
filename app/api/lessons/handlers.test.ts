import {
  getLessonsHandler,
  createLessonHandler,
  updateLessonHandler,
  deleteLessonHandler,
  validateMutationPermission,
} from '@/app/api/lessons/handlers';

describe('Lesson API Handlers', () => {
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const mockSupabase: any = {
    from: jest.fn(),
  };

  const mockUser = { id: 'user-123' };
  const adminProfile = { isAdmin: true, isTeacher: null, isStudent: null };
  const teacherProfile = { isAdmin: false, isTeacher: true, isStudent: null };
  const studentProfile = { isAdmin: false, isTeacher: null, isStudent: true };

  beforeEach(() => {
    jest.clearAllMocks();
  });

  describe('validateMutationPermission', () => {
    it('allows admin', () => {
      expect(validateMutationPermission(adminProfile)).toBe(true);
    });
    it('allows teacher', () => {
      expect(validateMutationPermission(teacherProfile)).toBe(true);
    });
    it('denies student', () => {
      expect(validateMutationPermission(studentProfile)).toBe(false);
    });
    it('denies null profile', () => {
      expect(validateMutationPermission(null)).toBe(false);
    });
  });

  describe('getLessonsHandler', () => {
    it('returns 401 without user', async () => {
      const result = await getLessonsHandler(mockSupabase, null, null, {});
      expect(result).toEqual({ error: 'Unauthorized', status: 401 });
    });

    it('applies filters, sort and pagination', async () => {
      // Mock main lessons base query (select *, count: exact)
      const baseQueryMock = {
        select: jest.fn().mockReturnThis(),
        in: jest.fn().mockReturnThis(),
        or: jest.fn().mockReturnThis(),
        eq: jest.fn().mockReturnThis(),
        order: jest.fn().mockReturnThis(),
        range: jest.fn().mockResolvedValue({ data: [], error: null, count: 0 }),
      };

      // Mock teacher's students ID query (inside getTeacherStudentIds)
      const studentQueryMock = {
        select: jest.fn().mockReturnThis(),
        eq: jest.fn().mockResolvedValue({
          data: [{ student_id: 's1' }, { student_id: 's2' }],
          error: null,
        }),
      };

      // First call: base query, second call: teacher students query
      mockSupabase.from.mockReturnValueOnce(baseQueryMock).mockReturnValueOnce(studentQueryMock);

      await getLessonsHandler(mockSupabase, mockUser, teacherProfile, {
        userId: 'u1',
        studentId: 's1',
        filter: 'SCHEDULED',
        sort: 'date',
        sortOrder: 'asc',
        page: 2,
        limit: 10,
      });

      // Verify main base query was created
      expect(mockSupabase.from).toHaveBeenNthCalledWith(1, 'lessons');
      expect(baseQueryMock.select).toHaveBeenCalledWith(
        `
      *,
      profile:profiles!lessons_student_id_fkey(id, full_name, email),
      teacher_profile:profiles!lessons_teacher_id_fkey(id, full_name, email),
      lesson_songs(
        song:songs(title)
      ),
      assignments(title)
    `,
        { count: 'exact' }
      );

      // Verify getTeacherStudentIds was called
      expect(mockSupabase.from).toHaveBeenNthCalledWith(2, 'lessons');
      expect(studentQueryMock.select).toHaveBeenCalledWith('student_id');
      expect(studentQueryMock.eq).toHaveBeenCalledWith('teacher_id', 'user-123');

      // Verify filters applied to base query
      expect(baseQueryMock.in).toHaveBeenCalledWith('student_id', ['s1', 's2']);
      expect(baseQueryMock.eq).toHaveBeenCalledWith('status', 'SCHEDULED');
      expect(baseQueryMock.order).toHaveBeenCalledWith('date', {
        ascending: true,
      });
      expect(baseQueryMock.range).toHaveBeenCalled();
    });
    it('handles database error', async () => {
      // Mock main lessons base query
      const baseQueryMock = {
        select: jest.fn().mockReturnThis(),
        in: jest.fn().mockReturnThis(),
        or: jest.fn().mockReturnThis(),
        eq: jest.fn().mockReturnThis(),
        order: jest.fn().mockReturnThis(),
        range: jest.fn().mockResolvedValue({ data: null, error: { message: 'db error' } }),
      };

      // Mock teacher's students query
      const studentQueryMock = {
        select: jest.fn().mockReturnThis(),
        eq: jest.fn().mockResolvedValue({
          data: [{ student_id: 's1' }],
          error: null,
        }),
      };

      mockSupabase.from.mockReturnValueOnce(baseQueryMock).mockReturnValueOnce(studentQueryMock);

      const result = await getLessonsHandler(mockSupabase, mockUser, teacherProfile, {});
      expect(result).toEqual({ error: 'db error', status: 500 });
    });
  });

  describe('createLessonHandler', () => {
    const validLesson = {
      teacher_id: '11111111-1111-4111-a111-111111111111',
      student_id: '22222222-2222-4222-a222-222222222222',
      date: '2025-01-01',
      start_time: '10:00',
      title: 'Intro',
      notes: 'Bring picks',
      status: 'SCHEDULED',
    };

    it('returns 401 without user', async () => {
      const res = await createLessonHandler(mockSupabase, null, adminProfile, validLesson);
      expect(res).toEqual({ error: 'Unauthorized', status: 401 });
    });

    it('returns 403 for student', async () => {
      const res = await createLessonHandler(mockSupabase, mockUser, studentProfile, validLesson);
      expect(res).toEqual({
        error: 'Only admins and teachers can create lessons',
        status: 403,
      });
    });

    it('creates lesson for teacher', async () => {
      // Mock for the first call (get existing lessons to calculate number)
      const mockSelectChain = {
        eq: jest.fn().mockReturnThis(),
        order: jest.fn().mockReturnThis(),
        limit: jest.fn().mockReturnThis(),
        single: jest.fn().mockResolvedValue({ data: null, error: null }),
      };

      // Mock for the second call (insert lesson)
      const mockInsertChain = {
        select: jest.fn().mockReturnThis(),
        eq: jest.fn().mockReturnThis(),
        order: jest.fn().mockReturnThis(),
        limit: jest.fn().mockReturnThis(),
        single: jest.fn().mockResolvedValue({ data: validLesson, error: null }),
      };

      mockSupabase.from
        .mockReturnValueOnce({ select: jest.fn().mockReturnValue(mockSelectChain) })
        .mockReturnValueOnce({ insert: jest.fn().mockReturnValue(mockInsertChain) });

      const res = await createLessonHandler(mockSupabase, mockUser, teacherProfile, validLesson);
      expect(res.status).toBe(201);
      expect(res.lesson).toEqual(validLesson);
    });

    it('validates input with Zod', async () => {
      // Missing required fields
      const res = await createLessonHandler(mockSupabase, mockUser, teacherProfile, { title: '' });
      expect(res.status).toBe(400);
    });
  });

  describe('updateLessonHandler', () => {
    it('returns 401 without user', async () => {
      const res = await updateLessonHandler(mockSupabase, null, adminProfile, 'l-1', {
        title: 'New',
      });
      expect(res).toEqual({ error: 'Unauthorized', status: 401 });
    });

    it('returns 403 for student', async () => {
      const res = await updateLessonHandler(mockSupabase, mockUser, studentProfile, 'l-1', {
        title: 'New',
      });
      expect(res).toEqual({
        error: 'Only admins and teachers can update lessons',
        status: 403,
      });
    });

    it('updates lesson and returns data', async () => {
      const mockQuery = {
        update: jest.fn().mockReturnThis(),
        eq: jest.fn().mockReturnThis(),
        select: jest.fn().mockReturnThis(),
        single: jest.fn().mockResolvedValue({
          data: { id: 'l-1', title: 'New' },
          error: null,
        }),
      };
      mockSupabase.from.mockReturnValue(mockQuery);

      const res = await updateLessonHandler(mockSupabase, mockUser, teacherProfile, 'l-1', {
        title: 'New',
      });
      expect(res.status).toBe(200);
      expect(res.lesson).toEqual({ id: 'l-1', title: 'New' });
      expect(mockQuery.update).toHaveBeenCalled();
    });
  });

  describe('deleteLessonHandler', () => {
    it('returns 401 without user', async () => {
      const res = await deleteLessonHandler(mockSupabase, null, adminProfile, 'l-1');
      expect(res).toEqual({ error: 'Unauthorized', status: 401 });
    });

    it('returns 403 for student', async () => {
      const res = await deleteLessonHandler(mockSupabase, mockUser, studentProfile, 'l-1');
      expect(res).toEqual({
        error: 'Only admins and teachers can delete lessons',
        status: 403,
      });
    });

    it('deletes lesson for teacher', async () => {
      const mockQuery = {
        delete: jest.fn().mockReturnThis(),
        eq: jest.fn().mockResolvedValue({ error: null }),
      };
      mockSupabase.from.mockReturnValue(mockQuery);

      const res = await deleteLessonHandler(mockSupabase, mockUser, teacherProfile, 'l-1');
      expect(res).toEqual({ status: 200 });
    });
  });
});
