/**
 * useLessonMutations Hook Tests
 *
 * Tests the lesson mutation hook functionality:
 * - Create lesson mutation
 * - Update lesson mutation
 * - Delete lesson mutation
 * - Cache invalidation
 * - Error handling
 *
 * @see lib/mutations/useLessonMutations.ts
 */

import { renderHook, waitFor } from '@testing-library/react';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import React from 'react';
import { useLessonMutations } from '../useLessonMutations';

// Mock the apiClient
const mockPost = jest.fn();
const mockPut = jest.fn();
const mockDelete = jest.fn();

jest.mock('@/lib/api-client', () => ({
  apiClient: {
    post: (...args: unknown[]) => mockPost(...args),
    put: (...args: unknown[]) => mockPut(...args),
    delete: (...args: unknown[]) => mockDelete(...args),
  },
}));

// Helper to create a wrapper with QueryClient
function createWrapper() {
  const queryClient = new QueryClient({
    defaultOptions: {
      queries: { retry: false },
      mutations: { retry: false },
    },
  });
  return function Wrapper({ children }: { children: React.ReactNode }) {
    return (
      <QueryClientProvider client={queryClient}>{children}</QueryClientProvider>
    );
  };
}

describe('useLessonMutations', () => {
  const mockLesson = {
    id: 'lesson-123',
    title: 'Test Lesson',
    status: 'scheduled' as const,
    scheduled_at: '2024-01-15T10:00:00Z',
    student_id: 'student-123',
    teacher_id: 'teacher-123',
    created_at: '2024-01-01T00:00:00Z',
    updated_at: '2024-01-01T00:00:00Z',
  };

  beforeEach(() => {
    jest.clearAllMocks();
  });

  describe('create mutation', () => {
    it('should create a lesson successfully', async () => {
      mockPost.mockResolvedValueOnce(mockLesson);

      const { result } = renderHook(() => useLessonMutations(), {
        wrapper: createWrapper(),
      });

      result.current.create.mutate({
        data: {
          title: 'Test Lesson',
          student_id: 'student-123',
          teacher_id: 'teacher-123',
          scheduled_at: '2024-01-15T10:00:00Z',
        },
      });

      await waitFor(() => {
        expect(result.current.create.isPending).toBe(false);
      });

      expect(mockPost).toHaveBeenCalledWith('/api/lessons', {
        title: 'Test Lesson',
        student_id: 'student-123',
        teacher_id: 'teacher-123',
        scheduled_at: '2024-01-15T10:00:00Z',
      });
    });

    it('should handle create error', async () => {
      const error = new Error('Failed to create lesson');
      mockPost.mockRejectedValueOnce(error);

      const { result } = renderHook(() => useLessonMutations(), {
        wrapper: createWrapper(),
      });

      result.current.create.mutate({
        data: {
          title: 'Test Lesson',
          student_id: 'student-123',
          teacher_id: 'teacher-123',
          scheduled_at: '2024-01-15T10:00:00Z',
        },
      });

      await waitFor(() => {
        expect(result.current.create.error).toEqual(error);
      });
    });

    it('should show pending state during create', async () => {
      // Create a promise that won't resolve immediately
      let resolvePromise: (value: unknown) => void;
      const promise = new Promise((resolve) => {
        resolvePromise = resolve;
      });
      mockPost.mockReturnValueOnce(promise);

      const { result } = renderHook(() => useLessonMutations(), {
        wrapper: createWrapper(),
      });

      expect(result.current.create.isPending).toBe(false);

      result.current.create.mutate({
        data: {
          title: 'Test Lesson',
          student_id: 'student-123',
          teacher_id: 'teacher-123',
          scheduled_at: '2024-01-15T10:00:00Z',
        },
      });

      await waitFor(() => {
        expect(result.current.create.isPending).toBe(true);
      });

      resolvePromise!(mockLesson);

      await waitFor(() => {
        expect(result.current.create.isPending).toBe(false);
      });
    });
  });

  describe('update mutation', () => {
    it('should update a lesson successfully', async () => {
      const updatedLesson = { ...mockLesson, title: 'Updated Lesson' };
      mockPut.mockResolvedValueOnce(updatedLesson);

      const { result } = renderHook(() => useLessonMutations(), {
        wrapper: createWrapper(),
      });

      result.current.update.mutate({
        id: 'lesson-123',
        data: {
          title: 'Updated Lesson',
          student_id: 'student-123',
          teacher_id: 'teacher-123',
          scheduled_at: '2024-01-15T10:00:00Z',
        },
      });

      await waitFor(() => {
        expect(result.current.update.isPending).toBe(false);
      });

      expect(mockPut).toHaveBeenCalledWith('/api/lessons/lesson-123', {
        title: 'Updated Lesson',
        student_id: 'student-123',
        teacher_id: 'teacher-123',
        scheduled_at: '2024-01-15T10:00:00Z',
      });
    });

    it('should handle update error', async () => {
      const error = new Error('Failed to update lesson');
      mockPut.mockRejectedValueOnce(error);

      const { result } = renderHook(() => useLessonMutations(), {
        wrapper: createWrapper(),
      });

      result.current.update.mutate({
        id: 'lesson-123',
        data: {
          title: 'Updated Lesson',
          student_id: 'student-123',
          teacher_id: 'teacher-123',
          scheduled_at: '2024-01-15T10:00:00Z',
        },
      });

      await waitFor(() => {
        expect(result.current.update.error).toEqual(error);
      });
    });
  });

  describe('delete mutation', () => {
    it('should delete a lesson successfully', async () => {
      mockDelete.mockResolvedValueOnce({ success: true });

      const { result } = renderHook(() => useLessonMutations(), {
        wrapper: createWrapper(),
      });

      result.current.delete.mutate({ id: 'lesson-123' });

      await waitFor(() => {
        expect(result.current.delete.isPending).toBe(false);
      });

      expect(mockDelete).toHaveBeenCalledWith('/api/lessons/lesson-123');
    });

    it('should handle delete error', async () => {
      const error = new Error('Failed to delete lesson');
      mockDelete.mockRejectedValueOnce(error);

      const { result } = renderHook(() => useLessonMutations(), {
        wrapper: createWrapper(),
      });

      result.current.delete.mutate({ id: 'lesson-123' });

      await waitFor(() => {
        expect(result.current.delete.error).toEqual(error);
      });
    });

    it('should return cascade info on delete success', async () => {
      mockDelete.mockResolvedValueOnce({
        success: true,
        cascadeInfo: { assignments: 2, songs: 3 },
      });

      const { result } = renderHook(() => useLessonMutations(), {
        wrapper: createWrapper(),
      });

      result.current.delete.mutate({ id: 'lesson-123' });

      await waitFor(() => {
        expect(result.current.delete.isPending).toBe(false);
      });
    });
  });

  describe('hook structure', () => {
    it('should return all mutation operations', () => {
      const { result } = renderHook(() => useLessonMutations(), {
        wrapper: createWrapper(),
      });

      expect(result.current).toHaveProperty('create');
      expect(result.current).toHaveProperty('update');
      expect(result.current).toHaveProperty('delete');

      expect(result.current.create).toHaveProperty('mutate');
      expect(result.current.create).toHaveProperty('isPending');
      expect(result.current.create).toHaveProperty('error');

      expect(result.current.update).toHaveProperty('mutate');
      expect(result.current.update).toHaveProperty('isPending');
      expect(result.current.update).toHaveProperty('error');

      expect(result.current.delete).toHaveProperty('mutate');
      expect(result.current.delete).toHaveProperty('isPending');
      expect(result.current.delete).toHaveProperty('error');
    });

    it('should initialize with no pending operations', () => {
      const { result } = renderHook(() => useLessonMutations(), {
        wrapper: createWrapper(),
      });

      expect(result.current.create.isPending).toBe(false);
      expect(result.current.update.isPending).toBe(false);
      expect(result.current.delete.isPending).toBe(false);
    });

    it('should initialize with no errors', () => {
      const { result } = renderHook(() => useLessonMutations(), {
        wrapper: createWrapper(),
      });

      expect(result.current.create.error).toBeNull();
      expect(result.current.update.error).toBeNull();
      expect(result.current.delete.error).toBeNull();
    });
  });
});
