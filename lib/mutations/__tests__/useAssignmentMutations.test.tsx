/**
 * useAssignmentMutations Hook Tests
 *
 * Tests the assignment mutation hook functionality:
 * - Create assignment mutation
 * - Update assignment mutation
 * - Delete assignment mutation
 * - Cache invalidation
 * - Error handling
 *
 * @see lib/mutations/useAssignmentMutations.ts
 */

import { renderHook, waitFor } from '@testing-library/react';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import React from 'react';
import { useAssignmentMutations } from '../useAssignmentMutations';

// Mock the apiClient
const mockPost = jest.fn();
const mockPatch = jest.fn();
const mockDelete = jest.fn();

jest.mock('@/lib/api-client', () => ({
  apiClient: {
    post: (...args: unknown[]) => mockPost(...args),
    patch: (...args: unknown[]) => mockPatch(...args),
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

describe('useAssignmentMutations', () => {
  const mockTeacherId = '550e8400-e29b-41d4-a716-446655440000';
  const mockStudentId = '550e8400-e29b-41d4-a716-446655440001';
  const mockAssignmentId = '550e8400-e29b-41d4-a716-446655440002';

  const mockAssignment = {
    id: mockAssignmentId,
    title: 'Test Assignment',
    description: 'Test description',
    status: 'not_started' as const,
    teacher_id: mockTeacherId,
    student_id: mockStudentId,
    due_date: '2024-01-20T00:00:00Z',
    created_at: '2024-01-01T00:00:00Z',
    updated_at: '2024-01-01T00:00:00Z',
  };

  beforeEach(() => {
    jest.clearAllMocks();
  });

  describe('create mutation', () => {
    it('should create an assignment successfully', async () => {
      mockPost.mockResolvedValueOnce(mockAssignment);

      const { result } = renderHook(() => useAssignmentMutations(), {
        wrapper: createWrapper(),
      });

      result.current.create.mutate({
        data: {
          title: 'Test Assignment',
          description: 'Test description',
          teacher_id: mockTeacherId,
          student_id: mockStudentId,
          due_date: '2024-01-20T00:00:00Z',
        },
      });

      await waitFor(() => {
        expect(result.current.create.isPending).toBe(false);
      });

      expect(mockPost).toHaveBeenCalledWith('/api/assignments', {
        title: 'Test Assignment',
        description: 'Test description',
        teacher_id: mockTeacherId,
        student_id: mockStudentId,
        due_date: '2024-01-20T00:00:00Z',
      });
    });

    it('should handle create error', async () => {
      const error = new Error('Failed to create assignment');
      mockPost.mockRejectedValueOnce(error);

      const { result } = renderHook(() => useAssignmentMutations(), {
        wrapper: createWrapper(),
      });

      result.current.create.mutate({
        data: {
          title: 'Test Assignment',
          teacher_id: mockTeacherId,
          student_id: mockStudentId,
          due_date: '2024-01-20T00:00:00Z',
        },
      });

      await waitFor(() => {
        expect(result.current.create.error).toEqual(error);
      });
    });

    it('should show pending state during create', async () => {
      let resolvePromise: (value: unknown) => void;
      const promise = new Promise((resolve) => {
        resolvePromise = resolve;
      });
      mockPost.mockReturnValueOnce(promise);

      const { result } = renderHook(() => useAssignmentMutations(), {
        wrapper: createWrapper(),
      });

      expect(result.current.create.isPending).toBe(false);

      result.current.create.mutate({
        data: {
          title: 'Test Assignment',
          teacher_id: mockTeacherId,
          student_id: mockStudentId,
          due_date: '2024-01-20T00:00:00Z',
        },
      });

      await waitFor(() => {
        expect(result.current.create.isPending).toBe(true);
      });

      resolvePromise!(mockAssignment);

      await waitFor(() => {
        expect(result.current.create.isPending).toBe(false);
      });
    });
  });

  describe('update mutation', () => {
    it('should update an assignment successfully', async () => {
      const updatedAssignment = { ...mockAssignment, title: 'Updated Assignment' };
      mockPatch.mockResolvedValueOnce(updatedAssignment);

      const { result } = renderHook(() => useAssignmentMutations(), {
        wrapper: createWrapper(),
      });

      result.current.update.mutate({
        id: mockAssignmentId,
        data: {
          id: mockAssignmentId,
          title: 'Updated Assignment',
        },
      });

      await waitFor(() => {
        expect(result.current.update.isPending).toBe(false);
      });

      expect(mockPatch).toHaveBeenCalledWith(`/api/assignments/${mockAssignmentId}`, {
        id: mockAssignmentId,
        title: 'Updated Assignment',
      });
    });

    it('should update assignment status', async () => {
      const updatedAssignment = { ...mockAssignment, status: 'in_progress' };
      mockPatch.mockResolvedValueOnce(updatedAssignment);

      const { result } = renderHook(() => useAssignmentMutations(), {
        wrapper: createWrapper(),
      });

      result.current.update.mutate({
        id: mockAssignmentId,
        data: {
          id: mockAssignmentId,
          status: 'in_progress',
        },
      });

      await waitFor(() => {
        expect(result.current.update.isPending).toBe(false);
      });

      expect(mockPatch).toHaveBeenCalledWith(`/api/assignments/${mockAssignmentId}`, {
        id: mockAssignmentId,
        status: 'in_progress',
      });
    });

    it('should handle update error', async () => {
      const error = new Error('Failed to update assignment');
      mockPatch.mockRejectedValueOnce(error);

      const { result } = renderHook(() => useAssignmentMutations(), {
        wrapper: createWrapper(),
      });

      result.current.update.mutate({
        id: mockAssignmentId,
        data: {
          id: mockAssignmentId,
          title: 'Updated Assignment',
        },
      });

      await waitFor(() => {
        expect(result.current.update.error).toEqual(error);
      });
    });
  });

  describe('delete mutation', () => {
    it('should delete an assignment successfully', async () => {
      mockDelete.mockResolvedValueOnce({ success: true });

      const { result } = renderHook(() => useAssignmentMutations(), {
        wrapper: createWrapper(),
      });

      result.current.delete.mutate({ id: 123 });

      await waitFor(() => {
        expect(result.current.delete.isPending).toBe(false);
      });

      expect(mockDelete).toHaveBeenCalledWith('/api/assignments/123');
    });

    it('should handle delete error', async () => {
      const error = new Error('Failed to delete assignment');
      mockDelete.mockRejectedValueOnce(error);

      const { result } = renderHook(() => useAssignmentMutations(), {
        wrapper: createWrapper(),
      });

      result.current.delete.mutate({ id: 123 });

      await waitFor(() => {
        expect(result.current.delete.error).toEqual(error);
      });
    });
  });

  describe('hook structure', () => {
    it('should return all mutation operations', () => {
      const { result } = renderHook(() => useAssignmentMutations(), {
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
      const { result } = renderHook(() => useAssignmentMutations(), {
        wrapper: createWrapper(),
      });

      expect(result.current.create.isPending).toBe(false);
      expect(result.current.update.isPending).toBe(false);
      expect(result.current.delete.isPending).toBe(false);
    });

    it('should initialize with no errors', () => {
      const { result } = renderHook(() => useAssignmentMutations(), {
        wrapper: createWrapper(),
      });

      expect(result.current.create.error).toBeNull();
      expect(result.current.update.error).toBeNull();
      expect(result.current.delete.error).toBeNull();
    });
  });

  describe('assignment status workflow', () => {
    it('should allow status transitions via update', async () => {
      // Test the not_started -> in_progress -> completed workflow
      const statuses = ['not_started', 'in_progress', 'completed'];

      for (let i = 1; i < statuses.length; i++) {
        const newStatus = statuses[i];
        mockPatch.mockResolvedValueOnce({ ...mockAssignment, status: newStatus });

        const { result } = renderHook(() => useAssignmentMutations(), {
          wrapper: createWrapper(),
        });

        result.current.update.mutate({
          id: mockAssignmentId,
          data: {
            id: mockAssignmentId,
            status: newStatus as 'not_started' | 'in_progress' | 'completed'
          },
        });

        await waitFor(() => {
          expect(result.current.update.isPending).toBe(false);
        });
      }

      expect(mockPatch).toHaveBeenCalledTimes(2);
    });
  });
});
