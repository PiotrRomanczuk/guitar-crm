/**
 * Lesson API Route Tests
 * Tests for /api/lessons endpoints (GET, POST)
 */

import { NextRequest } from 'next/server';
import { GET, POST } from '@/app/api/lessons/route';
import { createClient } from '@/lib/supabase/server';

// Mock Supabase client
jest.mock('@/lib/supabase/server', () => ({
  createClient: jest.fn(),
}));

describe.skip('Lesson API - Main Route', () => {
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

    // Setup default mock Supabase client
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
      or: jest.fn().mockReturnThis(),
      eq: jest.fn().mockReturnThis(),
      order: jest.fn().mockReturnThis(),
      single: jest.fn(),
    };

    (createClient as jest.Mock).mockResolvedValue(mockSupabase);
  });

  describe('GET /api/lessons', () => {
    it('should return unauthorized if user is not authenticated', async () => {
      mockSupabase.auth.getUser.mockResolvedValue({
        data: { user: null },
        error: null,
      });

      const request = new NextRequest('http://localhost:3000/api/lessons');
      const response = await GET(request);
      const data = await response.json();

      expect(response.status).toBe(401);
      expect(data.error).toBe('Unauthorized');
    });

    it('should return all lessons for authenticated user', async () => {
      mockSupabase.select.mockResolvedValue({
        data: [mockLesson],
        error: null,
      });

      const request = new NextRequest('http://localhost:3000/api/lessons');
      const response = await GET(request);
      const data = await response.json();

      expect(response.status).toBe(200);
      expect(data.lessons).toHaveLength(1);
      expect(data.lessons[0].id).toBe('lesson-123');
      expect(mockSupabase.from).toHaveBeenCalledWith('lessons');
    });

    it('should filter lessons by userId', async () => {
      mockSupabase.select.mockResolvedValue({
        data: [mockLesson],
        error: null,
      });

      const request = new NextRequest('http://localhost:3000/api/lessons?userId=student-456');
      const response = await GET(request);
      const data = await response.json();
      console.log(data);

      expect(response.status).toBe(200);
      expect(mockSupabase.or).toHaveBeenCalledWith(
        'student_id.eq.student-456,teacher_id.eq.student-456'
      );
    });

    it('should filter lessons by status', async () => {
      mockSupabase.select.mockResolvedValue({
        data: [mockLesson],
        error: null,
      });

      const request = new NextRequest('http://localhost:3000/api/lessons?filter=SCHEDULED');
      const response = await GET(request);
      const data = await response.json();
      console.log(data);

      expect(response.status).toBe(200);
      expect(mockSupabase.eq).toHaveBeenCalledWith('status', 'SCHEDULED');
    });

    it('should return error for invalid status filter', async () => {
      const request = new NextRequest('http://localhost:3000/api/lessons?filter=INVALID_STATUS');
      const response = await GET(request);
      const data = await response.json();

      expect(response.status).toBe(400);
      expect(data.error).toBe('Invalid status filter');
    });

    it('should sort lessons by date', async () => {
      mockSupabase.select.mockResolvedValue({
        data: [mockLesson],
        error: null,
      });

      const request = new NextRequest('http://localhost:3000/api/lessons?sort=date');
      const response = await GET(request);

      expect(response.status).toBe(200);
      expect(mockSupabase.order).toHaveBeenCalledWith('date', {
        ascending: true,
      });
    });

    it('should filter lessons by studentId', async () => {
      mockSupabase.select.mockResolvedValue({
        data: [mockLesson],
        error: null,
      });

      const request = new NextRequest(
        'http://localhost:3000/api/lessons?studentId=550e8400-e29b-41d4-a716-446655440000'
      );
      const response = await GET(request);
      const data = await response.json();
      console.log(data);

      expect(response.status).toBe(200);
      expect(mockSupabase.eq).toHaveBeenCalledWith(
        'student_id',
        '550e8400-e29b-41d4-a716-446655440000'
      );
    });

    it('should return error for invalid studentId format', async () => {
      const request = new NextRequest('http://localhost:3000/api/lessons?studentId=invalid-uuid');
      const response = await GET(request);
      const data = await response.json();

      expect(response.status).toBe(400);
      expect(data.error).toBe('Invalid student ID format');
    });

    it('should handle database errors gracefully', async () => {
      mockSupabase.select.mockResolvedValue({
        data: null,
        error: { message: 'Database connection failed' },
      });

      const request = new NextRequest('http://localhost:3000/api/lessons');
      const response = await GET(request);
      const data = await response.json();

      expect(response.status).toBe(500);
      expect(data.error).toBe('Database connection failed');
    });

    it('should handle lessons with null profile data', async () => {
      const lessonWithNullProfile = {
        ...mockLesson,
        profile: null,
        teacher_profile: null,
      };

      mockSupabase.select.mockResolvedValue({
        data: [lessonWithNullProfile],
        error: null,
      });

      const request = new NextRequest('http://localhost:3000/api/lessons');
      const response = await GET(request);
      const data = await response.json();

      expect(response.status).toBe(200);
      expect(data.lessons).toHaveLength(1);
      expect(data.lessons[0].profile).toBeNull();
    });

    it('should handle lessons with missing optional fields', async () => {
      const minimalLesson = {
        id: 'lesson-123',
        student_id: 'student-456',
        teacher_id: 'teacher-789',
        creator_user_id: 'user-123',
        status: 'SCHEDULED',
        date: '2024-01-15T10:00:00Z',
        created_at: '2024-01-01T00:00:00Z',
      };

      mockSupabase.select.mockResolvedValue({
        data: [minimalLesson],
        error: null,
      });

      const request = new NextRequest('http://localhost:3000/api/lessons');
      const response = await GET(request);
      const data = await response.json();

      expect(response.status).toBe(200);
      expect(data.lessons).toHaveLength(1);
    });
  });

  describe('POST /api/lessons', () => {
    beforeEach(() => {
      mockSupabase.from = jest.fn().mockReturnThis();
      mockSupabase.select = jest.fn().mockReturnThis();
      mockSupabase.single = jest.fn().mockResolvedValue({ data: mockProfile, error: null });
      mockSupabase.insert = jest.fn().mockReturnThis();
    });

    it('should return unauthorized if user is not authenticated', async () => {
      mockSupabase.auth.getUser.mockResolvedValue({
        data: { user: null },
        error: null,
      });

      const request = new NextRequest('http://localhost:3000/api/lessons', {
        method: 'POST',
        body: JSON.stringify({}),
      });
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

      const request = new NextRequest('http://localhost:3000/api/lessons', {
        method: 'POST',
        body: JSON.stringify({
          student_id: 'student-456',
          teacher_id: 'teacher-789',
          date: '2024-01-15T10:00:00Z',
        }),
      });
      const response = await POST(request);
      const data = await response.json();

      expect(response.status).toBe(403);
      expect(data.error).toBe('Forbidden');
    });

    it('should create a lesson with valid data', async () => {
      mockSupabase.insert.mockReturnThis();
      mockSupabase.select.mockReturnThis();
      mockSupabase.single.mockResolvedValueOnce({
        data: mockProfile,
        error: null,
      });
      mockSupabase.single.mockResolvedValueOnce({
        data: mockLesson,
        error: null,
      });

      const lessonData = {
        student_id: 'student-456',
        teacher_id: 'teacher-789',
        title: 'Guitar Basics',
        notes: 'Introduction to guitar',
        date: '2024-01-15T10:00:00Z',
        start_time: '10:00',
      };

      const request = new NextRequest('http://localhost:3000/api/lessons', {
        method: 'POST',
        body: JSON.stringify(lessonData),
      });
      const response = await POST(request);
      const data = await response.json();

      expect(response.status).toBe(200);
      expect(data.id).toBe('lesson-123');
      expect(mockSupabase.insert).toHaveBeenCalled();
    });

    it('should return validation error for missing required fields', async () => {
      const request = new NextRequest('http://localhost:3000/api/lessons', {
        method: 'POST',
        body: JSON.stringify({
          title: 'Guitar Basics',
          // Missing student_id and teacher_id
        }),
      });
      const response = await POST(request);
      const data = await response.json();

      expect(response.status).toBe(400);
      expect(data.error).toBe('Invalid lesson data');
    });

    it('should return validation error for invalid UUID format', async () => {
      const request = new NextRequest('http://localhost:3000/api/lessons', {
        method: 'POST',
        body: JSON.stringify({
          student_id: 'invalid-uuid',
          teacher_id: 'teacher-789',
        }),
      });
      const response = await POST(request);
      const data = await response.json();

      expect(response.status).toBe(400);
      expect(data.error).toBe('Invalid lesson data');
    });

    it('should handle database insertion errors', async () => {
      mockSupabase.insert.mockReturnThis();
      mockSupabase.select.mockReturnThis();
      mockSupabase.single.mockResolvedValueOnce({
        data: mockProfile,
        error: null,
      });
      mockSupabase.single.mockResolvedValueOnce({
        data: null,
        error: { message: 'Database error' },
      });

      const request = new NextRequest('http://localhost:3000/api/lessons', {
        method: 'POST',
        body: JSON.stringify({
          student_id: 'student-456',
          teacher_id: 'teacher-789',
          date: '2024-01-15T10:00:00Z',
        }),
      });
      const response = await POST(request);
      const data = await response.json();

      expect(response.status).toBe(500);
      expect(data.error).toBe('Database error');
    });

    it('should set default status to SCHEDULED if not provided', async () => {
      mockSupabase.insert.mockReturnThis();
      mockSupabase.select.mockReturnThis();
      mockSupabase.single.mockResolvedValueOnce({
        data: mockProfile,
        error: null,
      });
      mockSupabase.single.mockResolvedValueOnce({
        data: { ...mockLesson, status: 'SCHEDULED' },
        error: null,
      });

      const request = new NextRequest('http://localhost:3000/api/lessons', {
        method: 'POST',
        body: JSON.stringify({
          student_id: 'student-456',
          teacher_id: 'teacher-789',
          date: '2024-01-15T10:00:00Z',
        }),
      });
      const response = await POST(request);
      const data = await response.json();

      expect(response.status).toBe(200);
      expect(data.status).toBe('SCHEDULED');
    });
  });
});
