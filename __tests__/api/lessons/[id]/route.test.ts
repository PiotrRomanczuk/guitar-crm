/**
 * Lesson API [id] Route Tests
 * Tests for /api/lessons/[id] endpoints (GET, PUT, DELETE)
 */

import { NextRequest } from 'next/server';
import { GET, PUT, DELETE } from '@/app/api/lessons/[id]/route';
import { createClient } from '@/lib/supabase/server';

// Mock Supabase client
jest.mock('@/lib/supabase/server', () => ({
	createClient: jest.fn(),
}));

describe.skip('Lesson API - [id] Route', () => {
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
		notes: 'Introduction to guitar',
		date: '2024-01-15T10:00:00Z',
		start_time: '10:00',
		status: 'SCHEDULED',
		lesson_number: 1,
		lesson_teacher_number: 1,
		created_at: '2024-01-01T00:00:00Z',
		updated_at: '2024-01-01T00:00:00Z',
		profile: {
			email: 'student@example.com',
			firstName: 'John',
			lastName: 'Doe',
		},
		teacher_profile: {
			email: 'teacher@example.com',
			firstName: 'Jane',
			lastName: 'Smith',
		},
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
			update: jest.fn().mockReturnThis(),
			delete: jest.fn().mockReturnThis(),
			eq: jest.fn().mockReturnThis(),
			single: jest.fn(),
		};

		(createClient as jest.Mock).mockResolvedValue(mockSupabase);
	});

	describe('GET /api/lessons/[id]', () => {
		it('should return unauthorized if user is not authenticated', async () => {
			mockSupabase.auth.getUser.mockResolvedValue({
				data: { user: null },
				error: null,
			});

			const request = new NextRequest(
				'http://localhost:3000/api/lessons/lesson-123'
			);
			const params = Promise.resolve({ id: 'lesson-123' });
			const response = await GET(request, { params });
			const data = await response.json();

			expect(response.status).toBe(401);
			expect(data.error).toBe('Unauthorized');
		});

		it('should return a lesson by id', async () => {
			mockSupabase.single.mockResolvedValue({
				data: mockLesson,
				error: null,
			});

			const request = new NextRequest(
				'http://localhost:3000/api/lessons/lesson-123'
			);
			const params = Promise.resolve({ id: 'lesson-123' });
			const response = await GET(request, { params });
			const data = await response.json();

			expect(response.status).toBe(200);
			expect(data.id).toBe('lesson-123');
			expect(mockSupabase.eq).toHaveBeenCalledWith('id', 'lesson-123');
		});

		it('should return 404 if lesson is not found', async () => {
			mockSupabase.single.mockResolvedValue({
				data: null,
				error: { code: 'PGRST116', message: 'No rows returned' },
			});

			const request = new NextRequest(
				'http://localhost:3000/api/lessons/nonexistent'
			);
			const params = Promise.resolve({ id: 'nonexistent' });
			const response = await GET(request, { params });
			const data = await response.json();

			expect(response.status).toBe(404);
			expect(data.error).toBe('Lesson not found');
		});

		it('should handle database errors', async () => {
			mockSupabase.single.mockResolvedValue({
				data: null,
				error: { message: 'Database connection failed' },
			});

			const request = new NextRequest(
				'http://localhost:3000/api/lessons/lesson-123'
			);
			const params = Promise.resolve({ id: 'lesson-123' });
			const response = await GET(request, { params });
			const data = await response.json();

			expect(response.status).toBe(500);
			expect(data.error).toBe('Database connection failed');
		});

		it('should sanitize and validate lesson data', async () => {
			const lessonWithInvalidData = {
				...mockLesson,
				date: '0000-00-00',
				created_at: '0000-00-00',
			};

			mockSupabase.single.mockResolvedValue({
				data: lessonWithInvalidData,
				error: null,
			});

			const request = new NextRequest(
				'http://localhost:3000/api/lessons/lesson-123'
			);
			const params = Promise.resolve({ id: 'lesson-123' });
			const response = await GET(request, { params });
			const data = await response.json();

			expect(response.status).toBe(200);
			// Sanitized dates should be valid ISO strings
			expect(data.date).not.toBe('0000-00-00');
		});
	});

	describe('PUT /api/lessons/[id]', () => {
		beforeEach(() => {
			mockSupabase.from = jest.fn().mockReturnThis();
			mockSupabase.select = jest.fn().mockReturnThis();
			mockSupabase.single = jest
				.fn()
				.mockResolvedValue({ data: mockProfile, error: null });
		});

		it('should return unauthorized if user is not authenticated', async () => {
			mockSupabase.auth.getUser.mockResolvedValue({
				data: { user: null },
				error: null,
			});

			const request = new NextRequest(
				'http://localhost:3000/api/lessons/lesson-123',
				{
					method: 'PUT',
					body: JSON.stringify({ title: 'Updated Title' }),
				}
			);
			const params = Promise.resolve({ id: 'lesson-123' });
			const response = await PUT(request, { params });
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
				'http://localhost:3000/api/lessons/lesson-123',
				{
					method: 'PUT',
					body: JSON.stringify({ title: 'Updated Title' }),
				}
			);
			const params = Promise.resolve({ id: 'lesson-123' });
			const response = await PUT(request, { params });
			const data = await response.json();

			expect(response.status).toBe(403);
			expect(data.error).toBe('Forbidden');
		});

		it('should update a lesson with valid data', async () => {
			const updatedLesson = { ...mockLesson, title: 'Updated Title' };

			mockSupabase.single.mockResolvedValueOnce({
				data: mockProfile,
				error: null,
			});
			mockSupabase.single.mockResolvedValueOnce({
				data: updatedLesson,
				error: null,
			});

			const request = new NextRequest(
				'http://localhost:3000/api/lessons/lesson-123',
				{
					method: 'PUT',
					body: JSON.stringify({ title: 'Updated Title' }),
				}
			);
			const params = Promise.resolve({ id: 'lesson-123' });
			const response = await PUT(request, { params });
			const data = await response.json();

			expect(response.status).toBe(200);
			expect(data.title).toBe('Updated Title');
			expect(mockSupabase.update).toHaveBeenCalled();
		});

		it('should return 404 if lesson does not exist', async () => {
			mockSupabase.single.mockResolvedValueOnce({
				data: mockProfile,
				error: null,
			});
			mockSupabase.single.mockResolvedValueOnce({
				data: null,
				error: { code: 'PGRST116', message: 'No rows returned' },
			});

			const request = new NextRequest(
				'http://localhost:3000/api/lessons/nonexistent',
				{
					method: 'PUT',
					body: JSON.stringify({ title: 'Updated Title' }),
				}
			);
			const params = Promise.resolve({ id: 'nonexistent' });
			const response = await PUT(request, { params });
			const data = await response.json();

			expect(response.status).toBe(404);
			expect(data.error).toBe('Lesson not found');
		});

		it('should return validation error for invalid update data', async () => {
			const request = new NextRequest(
				'http://localhost:3000/api/lessons/lesson-123',
				{
					method: 'PUT',
					body: JSON.stringify({ status: 'INVALID_STATUS' }),
				}
			);
			const params = Promise.resolve({ id: 'lesson-123' });
			const response = await PUT(request, { params });
			const data = await response.json();

			expect(response.status).toBe(400);
			expect(data.error).toBe('Invalid lesson update data');
		});

		it('should allow partial updates', async () => {
			const updatedLesson = { ...mockLesson, notes: 'Updated notes only' };

			mockSupabase.single.mockResolvedValueOnce({
				data: mockProfile,
				error: null,
			});
			mockSupabase.single.mockResolvedValueOnce({
				data: updatedLesson,
				error: null,
			});

			const request = new NextRequest(
				'http://localhost:3000/api/lessons/lesson-123',
				{
					method: 'PUT',
					body: JSON.stringify({ notes: 'Updated notes only' }),
				}
			);
			const params = Promise.resolve({ id: 'lesson-123' });
			const response = await PUT(request, { params });
			const data = await response.json();

			expect(response.status).toBe(200);
			expect(data.notes).toBe('Updated notes only');
		});
	});

	describe('DELETE /api/lessons/[id]', () => {
		beforeEach(() => {
			mockSupabase.from = jest.fn().mockReturnThis();
			mockSupabase.select = jest.fn().mockReturnThis();
			mockSupabase.single = jest
				.fn()
				.mockResolvedValue({ data: mockProfile, error: null });
		});

		it('should return unauthorized if user is not authenticated', async () => {
			mockSupabase.auth.getUser.mockResolvedValue({
				data: { user: null },
				error: null,
			});

			const request = new NextRequest(
				'http://localhost:3000/api/lessons/lesson-123',
				{
					method: 'DELETE',
				}
			);
			const params = Promise.resolve({ id: 'lesson-123' });
			const response = await DELETE(request, { params });
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
				'http://localhost:3000/api/lessons/lesson-123',
				{
					method: 'DELETE',
				}
			);
			const params = Promise.resolve({ id: 'lesson-123' });
			const response = await DELETE(request, { params });
			const data = await response.json();

			expect(response.status).toBe(403);
			expect(data.error).toBe('Forbidden');
		});

		it('should delete a lesson successfully', async () => {
			mockSupabase.delete.mockReturnThis();
			mockSupabase.eq.mockResolvedValue({
				error: null,
			});

			const request = new NextRequest(
				'http://localhost:3000/api/lessons/lesson-123',
				{
					method: 'DELETE',
				}
			);
			const params = Promise.resolve({ id: 'lesson-123' });
			const response = await DELETE(request, { params });
			const data = await response.json();

			expect(response.status).toBe(200);
			expect(data.success).toBe(true);
			expect(mockSupabase.delete).toHaveBeenCalled();
			expect(mockSupabase.eq).toHaveBeenCalledWith('id', 'lesson-123');
		});

		it('should return 404 if lesson does not exist', async () => {
			mockSupabase.delete.mockReturnThis();
			mockSupabase.eq.mockResolvedValue({
				error: { code: 'PGRST116', message: 'No rows returned' },
			});

			const request = new NextRequest(
				'http://localhost:3000/api/lessons/nonexistent',
				{
					method: 'DELETE',
				}
			);
			const params = Promise.resolve({ id: 'nonexistent' });
			const response = await DELETE(request, { params });
			const data = await response.json();

			expect(response.status).toBe(404);
			expect(data.error).toBe('Lesson not found');
		});

		it('should handle database errors', async () => {
			mockSupabase.delete.mockReturnThis();
			mockSupabase.eq.mockResolvedValue({
				error: { message: 'Database connection failed' },
			});

			const request = new NextRequest(
				'http://localhost:3000/api/lessons/lesson-123',
				{
					method: 'DELETE',
				}
			);
			const params = Promise.resolve({ id: 'lesson-123' });
			const response = await DELETE(request, { params });
			const data = await response.json();

			expect(response.status).toBe(500);
			expect(data.error).toBe('Database connection failed');
		});
	});
});
