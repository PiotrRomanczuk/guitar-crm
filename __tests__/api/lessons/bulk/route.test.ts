/**
 * Lesson API Bulk Operations Tests
 * Tests for /api/lessons/bulk endpoints (POST, PUT, DELETE)
 */

import { NextRequest } from 'next/server';
import { POST, PUT, DELETE } from '@/app/api/lessons/bulk/route';
import { createClient } from '@/lib/supabase/server';

// Mock Supabase client
jest.mock('@/lib/supabase/server', () => ({
	createClient: jest.fn(),
}));

describe.skip('Lesson API - Bulk Operations', () => {
	const mockUser = {
		id: 'user-123',
		email: 'teacher@example.com',
	};

	const mockProfile = {
		role: 'teacher',
		user_id: 'user-123',
	};

	const mockLesson = {
		id: 'lesson-123',
		student_id: 'student-456',
		teacher_id: 'teacher-789',
		creator_user_id: 'user-123',
		title: 'Guitar Basics',
		date: '2024-01-15T10:00:00Z',
		status: 'SCHEDULED',
		created_at: '2024-01-01T00:00:00Z',
	};

	// eslint-disable-next-line @typescript-eslint/no-explicit-any
	let mockSupabase: any;

	beforeEach(() => {
		jest.clearAllMocks();

		mockSupabase = {
			auth: {
				getUser: jest.fn().mockResolvedValue({
					data: { user: mockUser },
					error: null,
				}),
			},
			from: jest.fn().mockReturnThis(),
			select: jest.fn().mockReturnThis(),
			insert: jest.fn().mockReturnThis(),
			update: jest.fn().mockReturnThis(),
			delete: jest.fn().mockReturnThis(),
			eq: jest.fn().mockReturnThis(),
			single: jest.fn(),
		};

		(createClient as jest.Mock).mockResolvedValue(mockSupabase);
	});

	describe('POST /api/lessons/bulk (Bulk Create)', () => {
		it('should return unauthorized if user is not authenticated', async () => {
			mockSupabase.auth.getUser.mockResolvedValue({
				data: { user: null },
				error: null,
			});

			const request = new NextRequest(
				'http://localhost:3000/api/lessons/bulk',
				{
					method: 'POST',
					body: JSON.stringify({ lessons: [] }),
				}
			);
			const response = await POST(request);
			const data = await response.json();

			expect(response.status).toBe(401);
			expect(data.error).toBe('Unauthorized');
		});

		it('should return forbidden if user is not admin or teacher', async () => {
			mockSupabase.single.mockResolvedValue({
				data: { role: 'student' },
				error: null,
			});

			const request = new NextRequest(
				'http://localhost:3000/api/lessons/bulk',
				{
					method: 'POST',
					body: JSON.stringify({ lessons: [] }),
				}
			);
			const response = await POST(request);
			const data = await response.json();

			expect(response.status).toBe(403);
			expect(data.error).toBe('Forbidden');
		});

		it('should return error if lessons array is missing', async () => {
			mockSupabase.single.mockResolvedValue({
				data: mockProfile,
				error: null,
			});

			const request = new NextRequest(
				'http://localhost:3000/api/lessons/bulk',
				{
					method: 'POST',
					body: JSON.stringify({}),
				}
			);
			const response = await POST(request);
			const data = await response.json();

			expect(response.status).toBe(400);
			expect(data.error).toBe('Lessons array is required and cannot be empty');
		});

		it('should return error if lessons array is empty', async () => {
			mockSupabase.single.mockResolvedValue({
				data: mockProfile,
				error: null,
			});

			const request = new NextRequest(
				'http://localhost:3000/api/lessons/bulk',
				{
					method: 'POST',
					body: JSON.stringify({ lessons: [] }),
				}
			);
			const response = await POST(request);
			const data = await response.json();

			expect(response.status).toBe(400);
			expect(data.error).toBe('Lessons array is required and cannot be empty');
		});

		it('should return error if more than 100 lessons', async () => {
			mockSupabase.single.mockResolvedValue({
				data: mockProfile,
				error: null,
			});

			const lessons = Array(101).fill({
				student_id: 'student-456',
				teacher_id: 'teacher-789',
			});

			const request = new NextRequest(
				'http://localhost:3000/api/lessons/bulk',
				{
					method: 'POST',
					body: JSON.stringify({ lessons }),
				}
			);
			const response = await POST(request);
			const data = await response.json();

			expect(response.status).toBe(400);
			expect(data.error).toBe('Cannot process more than 100 lessons at once');
		});

		it('should create multiple lessons successfully', async () => {
			mockSupabase.single.mockResolvedValueOnce({
				data: mockProfile,
				error: null,
			});

			// Mock successful inserts
			mockSupabase.single.mockResolvedValue({
				data: mockLesson,
				error: null,
			});

			const lessons = [
				{
					student_id: 'student-456',
					teacher_id: 'teacher-789',
					date: '2024-01-15T10:00:00Z',
				},
				{
					student_id: 'student-456',
					teacher_id: 'teacher-789',
					date: '2024-01-16T10:00:00Z',
				},
			];

			const request = new NextRequest(
				'http://localhost:3000/api/lessons/bulk',
				{
					method: 'POST',
					body: JSON.stringify({ lessons }),
				}
			);
			const response = await POST(request);
			const data = await response.json();

			expect(response.status).toBe(200);
			expect(data.success).toBe(2);
			expect(data.failed).toBe(0);
			expect(data.created).toHaveLength(2);
		});

		it('should handle validation errors for individual lessons', async () => {
			mockSupabase.single.mockResolvedValue({
				data: mockProfile,
				error: null,
			});

			const lessons = [
				{
					student_id: 'student-456',
					teacher_id: 'teacher-789',
					date: '2024-01-15T10:00:00Z',
				},
				{
					// Missing required fields
					title: 'Invalid Lesson',
				},
			];

			const request = new NextRequest(
				'http://localhost:3000/api/lessons/bulk',
				{
					method: 'POST',
					body: JSON.stringify({ lessons }),
				}
			);
			const response = await POST(request);
			const data = await response.json();

			expect(response.status).toBe(200);
			expect(data.errors).toHaveLength(1);
			expect(data.errors[0].error).toBe('Validation failed');
		});

		it('should handle database errors for individual lessons', async () => {
			mockSupabase.single.mockResolvedValueOnce({
				data: mockProfile,
				error: null,
			});

			// First lesson succeeds
			mockSupabase.single.mockResolvedValueOnce({
				data: mockLesson,
				error: null,
			});

			// Second lesson fails
			mockSupabase.single.mockResolvedValueOnce({
				data: null,
				error: { message: 'Database error' },
			});

			const lessons = [
				{
					student_id: 'student-456',
					teacher_id: 'teacher-789',
					date: '2024-01-15T10:00:00Z',
				},
				{
					student_id: 'student-456',
					teacher_id: 'teacher-789',
					date: '2024-01-16T10:00:00Z',
				},
			];

			const request = new NextRequest(
				'http://localhost:3000/api/lessons/bulk',
				{
					method: 'POST',
					body: JSON.stringify({ lessons }),
				}
			);
			const response = await POST(request);
			const data = await response.json();

			expect(response.status).toBe(200);
			expect(data.success).toBe(1);
			expect(data.failed).toBe(1);
		});
	});

	describe('PUT /api/lessons/bulk (Bulk Update)', () => {
		it('should update multiple lessons successfully', async () => {
			mockSupabase.single.mockResolvedValueOnce({
				data: mockProfile,
				error: null,
			});

			mockSupabase.single.mockResolvedValue({
				data: mockLesson,
				error: null,
			});

			const updates = [
				{
					id: 'lesson-1',
					title: 'Updated Title 1',
				},
				{
					id: 'lesson-2',
					status: 'COMPLETED',
				},
			];

			const request = new NextRequest(
				'http://localhost:3000/api/lessons/bulk',
				{
					method: 'PUT',
					body: JSON.stringify({ updates }),
				}
			);
			const response = await PUT(request);
			const data = await response.json();

			expect(response.status).toBe(200);
			expect(data.success).toBe(2);
			expect(data.failed).toBe(0);
		});

		it('should return error if ID is missing in update', async () => {
			mockSupabase.single.mockResolvedValue({
				data: mockProfile,
				error: null,
			});

			const updates = [
				{
					title: 'Updated Title',
					// Missing id
				},
			];

			const request = new NextRequest(
				'http://localhost:3000/api/lessons/bulk',
				{
					method: 'PUT',
					body: JSON.stringify({ updates }),
				}
			);
			const response = await PUT(request);
			const data = await response.json();

			expect(response.status).toBe(200);
			expect(data.errors).toHaveLength(1);
			expect(data.errors[0].error).toBe('Lesson ID is required');
		});
	});

	describe('DELETE /api/lessons/bulk (Bulk Delete)', () => {
		it('should delete multiple lessons successfully', async () => {
			mockSupabase.single.mockResolvedValue({
				data: mockProfile,
				error: null,
			});

			mockSupabase.delete.mockReturnThis();
			mockSupabase.eq.mockResolvedValue({
				error: null,
			});

			const lessonIds = ['lesson-1', 'lesson-2', 'lesson-3'];

			const request = new NextRequest(
				'http://localhost:3000/api/lessons/bulk',
				{
					method: 'DELETE',
					body: JSON.stringify({ lessonIds }),
				}
			);
			const response = await DELETE(request);
			const data = await response.json();

			expect(response.status).toBe(200);
			expect(data.success).toBe(3);
			expect(data.failed).toBe(0);
			expect(data.deleted).toHaveLength(3);
		});

		it('should return error if lessonIds array is missing', async () => {
			mockSupabase.single.mockResolvedValue({
				data: mockProfile,
				error: null,
			});

			const request = new NextRequest(
				'http://localhost:3000/api/lessons/bulk',
				{
					method: 'DELETE',
					body: JSON.stringify({}),
				}
			);
			const response = await DELETE(request);
			const data = await response.json();

			expect(response.status).toBe(400);
			expect(data.error).toBe(
				'Lesson IDs array is required and cannot be empty'
			);
		});

		it('should handle deletion errors for individual lessons', async () => {
			mockSupabase.single.mockResolvedValue({
				data: mockProfile,
				error: null,
			});

			mockSupabase.delete.mockReturnThis();

			// First two succeed, third fails
			mockSupabase.eq
				.mockResolvedValueOnce({ error: null })
				.mockResolvedValueOnce({ error: null })
				.mockResolvedValueOnce({ error: { message: 'Not found' } });

			const lessonIds = ['lesson-1', 'lesson-2', 'lesson-3'];

			const request = new NextRequest(
				'http://localhost:3000/api/lessons/bulk',
				{
					method: 'DELETE',
					body: JSON.stringify({ lessonIds }),
				}
			);
			const response = await DELETE(request);
			const data = await response.json();

			expect(response.status).toBe(200);
			expect(data.success).toBe(2);
			expect(data.failed).toBe(1);
		});
	});
});
