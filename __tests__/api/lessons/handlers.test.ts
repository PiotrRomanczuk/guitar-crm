import {
	getLessonsHandler,
	createLessonHandler,
	updateLessonHandler,
	deleteLessonHandler,
	validateMutationPermission,
} from '@/app/api/lessons/handlers';

describe('Lesson API Handlers', () => {
	const mockSupabase: any = {
		from: jest.fn(),
	};

	const mockUser = { id: 'user-123' };
	const adminProfile = { role: 'admin' };
	const teacherProfile = { role: 'teacher' };
	const studentProfile = { role: 'student' };

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
			const result = await getLessonsHandler(mockSupabase, null, {});
			expect(result).toEqual({ error: 'Unauthorized', status: 401 });
		});

		it('applies filters, sort and pagination', async () => {
			const mockQuery = {
				select: jest.fn().mockReturnThis(),
				or: jest.fn().mockReturnThis(),
				eq: jest.fn().mockReturnThis(),
				order: jest.fn().mockReturnThis(),
				range: jest.fn().mockResolvedValue({ data: [], error: null, count: 0 }),
			};
			mockSupabase.from.mockReturnValue(mockQuery);

			await getLessonsHandler(mockSupabase, mockUser, {
				userId: 'u1',
				studentId: 's1',
				filter: 'SCHEDULED',
				sort: 'date',
				sortOrder: 'asc',
				page: 2,
				limit: 10,
			});

			expect(mockSupabase.from).toHaveBeenCalledWith('lessons');
			expect(mockQuery.or).toHaveBeenCalled();
			expect(mockQuery.eq).toHaveBeenCalledWith('student_id', 's1');
			expect(mockQuery.order).toHaveBeenCalledWith('date', { ascending: true });
			expect(mockQuery.range).toHaveBeenCalled();
		});

		it('handles database error', async () => {
			const mockQuery = {
				select: jest.fn().mockReturnThis(),
				or: jest.fn().mockReturnThis(),
				eq: jest.fn().mockReturnThis(),
				order: jest.fn().mockReturnThis(),
				range: jest
					.fn()
					.mockResolvedValue({ data: null, error: { message: 'db' } }),
			};
			mockSupabase.from.mockReturnValue(mockQuery);

			const result = await getLessonsHandler(mockSupabase, mockUser, {});
			expect(result).toEqual({ error: 'db', status: 500 });
		});
	});

	describe('createLessonHandler', () => {
		const validLesson = {
			teacher_id: '11111111-1111-1111-1111-111111111111',
			student_id: '22222222-2222-2222-2222-222222222222',
			date: '2025-01-01T10:00:00.000Z',
			start_time: '10:00',
			title: 'Intro',
			notes: 'Bring picks',
			status: 'SCHEDULED',
		};

		it('returns 401 without user', async () => {
			const res = await createLessonHandler(
				mockSupabase,
				null,
				adminProfile,
				validLesson
			);
			expect(res).toEqual({ error: 'Unauthorized', status: 401 });
		});

		it('returns 403 for student', async () => {
			const res = await createLessonHandler(
				mockSupabase,
				mockUser,
				studentProfile,
				validLesson
			);
			expect(res).toEqual({
				error: 'Forbidden: Only teachers and admins can create lessons',
				status: 403,
			});
		});

		it('creates lesson for teacher', async () => {
			const mockQuery = {
				insert: jest.fn().mockReturnThis(),
				select: jest.fn().mockReturnThis(),
				single: jest.fn().mockResolvedValue({ data: validLesson, error: null }),
			};
			mockSupabase.from.mockReturnValue(mockQuery);

			const res = await createLessonHandler(
				mockSupabase,
				mockUser,
				teacherProfile,
				validLesson
			);
			expect(res.status).toBe(201);
			expect(res.lesson).toEqual(validLesson);
		});

		it('validates input with Zod', async () => {
			// Missing required fields
			const res = await createLessonHandler(
				mockSupabase,
				mockUser,
				teacherProfile,
				{ title: '' }
			);
			expect(res.status).toBe(422);
		});
	});

	describe('updateLessonHandler', () => {
		it('returns 401 without user', async () => {
			const res = await updateLessonHandler(
				mockSupabase,
				null,
				adminProfile,
				'l-1',
				{ title: 'New' }
			);
			expect(res).toEqual({ error: 'Unauthorized', status: 401 });
		});

		it('returns 403 for student', async () => {
			const res = await updateLessonHandler(
				mockSupabase,
				mockUser,
				studentProfile,
				'l-1',
				{ title: 'New' }
			);
			expect(res).toEqual({
				error: 'Forbidden: Only teachers and admins can update lessons',
				status: 403,
			});
		});

		it('updates lesson and returns data', async () => {
			const mockQuery = {
				update: jest.fn().mockReturnThis(),
				eq: jest.fn().mockReturnThis(),
				select: jest.fn().mockReturnThis(),
				single: jest
					.fn()
					.mockResolvedValue({
						data: { id: 'l-1', title: 'New' },
						error: null,
					}),
			};
			mockSupabase.from.mockReturnValue(mockQuery);

			const res = await updateLessonHandler(
				mockSupabase,
				mockUser,
				teacherProfile,
				'l-1',
				{ title: 'New' }
			);
			expect(res.status).toBe(200);
			expect(res.lesson).toEqual({ id: 'l-1', title: 'New' });
			expect(mockQuery.update).toHaveBeenCalled();
		});
	});

	describe('deleteLessonHandler', () => {
		it('returns 401 without user', async () => {
			const res = await deleteLessonHandler(
				mockSupabase,
				null,
				adminProfile,
				'l-1'
			);
			expect(res).toEqual({ error: 'Unauthorized', status: 401 });
		});

		it('returns 403 for student', async () => {
			const res = await deleteLessonHandler(
				mockSupabase,
				mockUser,
				studentProfile,
				'l-1'
			);
			expect(res).toEqual({
				error: 'Forbidden: Only teachers and admins can delete lessons',
				status: 403,
			});
		});

		it('deletes lesson for teacher', async () => {
			const mockQuery = {
				delete: jest.fn().mockReturnThis(),
				eq: jest.fn().mockResolvedValue({ error: null }),
			};
			mockSupabase.from.mockReturnValue(mockQuery);

			const res = await deleteLessonHandler(
				mockSupabase,
				mockUser,
				teacherProfile,
				'l-1'
			);
			expect(res).toEqual({ success: true, status: 200 });
		});
	});
});
