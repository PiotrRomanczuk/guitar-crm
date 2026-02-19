/**
 * useUserMutations Hook Tests
 *
 * Tests the user mutation hook functionality:
 * - Create user mutation
 * - Update user mutation
 * - Delete user mutation (soft delete via isActive)
 * - Update user role mutation
 * - Cache invalidation
 * - Error handling
 *
 * @see lib/mutations/useUserMutations.ts
 */

import { renderHook, waitFor } from '@testing-library/react';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import React from 'react';
import { useUserMutations } from '../useUserMutations';

// Mock the apiClient
const mockPost = jest.fn();
const mockPut = jest.fn();

jest.mock('@/lib/api-client', () => ({
  apiClient: {
    post: (...args: unknown[]) => mockPost(...args),
    put: (...args: unknown[]) => mockPut(...args),
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

describe('useUserMutations', () => {
  const mockUserId = '550e8400-e29b-41d4-a716-446655440000';

  const mockUser = {
    id: 1,
    user_id: mockUserId,
    email: 'test@example.com',
    firstName: 'Test',
    lastName: 'User',
    isStudent: true,
    isTeacher: false,
    isAdmin: false,
    isActive: true,
    created_at: new Date('2024-01-01'),
    updated_at: new Date('2024-01-01'),
  };

  beforeEach(() => {
    jest.clearAllMocks();
  });

  describe('create mutation', () => {
    it('should create a user successfully', async () => {
      mockPost.mockResolvedValueOnce(mockUser);

      const { result } = renderHook(() => useUserMutations(), {
        wrapper: createWrapper(),
      });

      result.current.create.mutate({
        data: {
          email: 'test@example.com',
          firstName: 'Test',
          lastName: 'User',
          isStudent: true,
        },
      });

      await waitFor(() => {
        expect(result.current.create.isPending).toBe(false);
      });

      expect(mockPost).toHaveBeenCalledWith('/api/users', {
        email: 'test@example.com',
        firstName: 'Test',
        lastName: 'User',
        isStudent: true,
      });
    });

    it('should handle create error', async () => {
      const error = new Error('Failed to create user');
      mockPost.mockRejectedValueOnce(error);

      const { result } = renderHook(() => useUserMutations(), {
        wrapper: createWrapper(),
      });

      result.current.create.mutate({
        data: {
          email: 'test@example.com',
          firstName: 'Test',
          lastName: 'User',
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

      const { result } = renderHook(() => useUserMutations(), {
        wrapper: createWrapper(),
      });

      expect(result.current.create.isPending).toBe(false);

      result.current.create.mutate({
        data: {
          email: 'test@example.com',
          firstName: 'Test',
          lastName: 'User',
        },
      });

      await waitFor(() => {
        expect(result.current.create.isPending).toBe(true);
      });

      resolvePromise!(mockUser);

      await waitFor(() => {
        expect(result.current.create.isPending).toBe(false);
      });
    });

    it('should create a shadow user without email', async () => {
      const shadowUser = { ...mockUser, email: '', isShadow: true };
      mockPost.mockResolvedValueOnce(shadowUser);

      const { result } = renderHook(() => useUserMutations(), {
        wrapper: createWrapper(),
      });

      result.current.create.mutate({
        data: {
          firstName: 'Shadow',
          lastName: 'User',
          isShadow: true,
          isStudent: true,
        },
      });

      await waitFor(() => {
        expect(result.current.create.isPending).toBe(false);
      });

      expect(mockPost).toHaveBeenCalledWith('/api/users', {
        firstName: 'Shadow',
        lastName: 'User',
        isShadow: true,
        isStudent: true,
      });
    });
  });

  describe('update mutation', () => {
    it('should update a user successfully', async () => {
      const updatedUser = { ...mockUser, firstName: 'Updated' };
      mockPut.mockResolvedValueOnce(updatedUser);

      const { result } = renderHook(() => useUserMutations(), {
        wrapper: createWrapper(),
      });

      result.current.update.mutate({
        id: mockUserId,
        data: {
          firstName: 'Updated',
        },
      });

      await waitFor(() => {
        expect(result.current.update.isPending).toBe(false);
      });

      expect(mockPut).toHaveBeenCalledWith(`/api/users/${mockUserId}`, {
        firstName: 'Updated',
      });
    });

    it('should handle update error', async () => {
      const error = new Error('Failed to update user');
      mockPut.mockRejectedValueOnce(error);

      const { result } = renderHook(() => useUserMutations(), {
        wrapper: createWrapper(),
      });

      result.current.update.mutate({
        id: mockUserId,
        data: {
          firstName: 'Updated',
        },
      });

      await waitFor(() => {
        expect(result.current.update.error).toEqual(error);
      });
    });
  });

  describe('delete mutation', () => {
    it('should soft delete a user by setting isActive to false', async () => {
      mockPut.mockResolvedValueOnce({ success: true });

      const { result } = renderHook(() => useUserMutations(), {
        wrapper: createWrapper(),
      });

      result.current.delete.mutate({ id: mockUserId });

      await waitFor(() => {
        expect(result.current.delete.isPending).toBe(false);
      });

      expect(mockPut).toHaveBeenCalledWith(`/api/users/${mockUserId}`, {
        isActive: false,
      });
    });

    it('should handle delete error', async () => {
      const error = new Error('Failed to delete user');
      mockPut.mockRejectedValueOnce(error);

      const { result } = renderHook(() => useUserMutations(), {
        wrapper: createWrapper(),
      });

      result.current.delete.mutate({ id: mockUserId });

      await waitFor(() => {
        expect(result.current.delete.error).toEqual(error);
      });
    });
  });

  describe('updateRole mutation', () => {
    it('should update user to admin role', async () => {
      const adminUser = { ...mockUser, isAdmin: true };
      mockPut.mockResolvedValueOnce(adminUser);

      const { result } = renderHook(() => useUserMutations(), {
        wrapper: createWrapper(),
      });

      result.current.updateRole.mutate({
        id: mockUserId,
        role: 'isAdmin',
        value: true,
      });

      await waitFor(() => {
        expect(result.current.updateRole.isPending).toBe(false);
      });

      expect(mockPut).toHaveBeenCalledWith(`/api/users/${mockUserId}`, {
        isAdmin: true,
      });
    });

    it('should update user to teacher role', async () => {
      const teacherUser = { ...mockUser, isTeacher: true };
      mockPut.mockResolvedValueOnce(teacherUser);

      const { result } = renderHook(() => useUserMutations(), {
        wrapper: createWrapper(),
      });

      result.current.updateRole.mutate({
        id: mockUserId,
        role: 'isTeacher',
        value: true,
      });

      await waitFor(() => {
        expect(result.current.updateRole.isPending).toBe(false);
      });

      expect(mockPut).toHaveBeenCalledWith(`/api/users/${mockUserId}`, {
        isTeacher: true,
      });
    });

    it('should remove student role', async () => {
      const nonStudentUser = { ...mockUser, isStudent: false };
      mockPut.mockResolvedValueOnce(nonStudentUser);

      const { result } = renderHook(() => useUserMutations(), {
        wrapper: createWrapper(),
      });

      result.current.updateRole.mutate({
        id: mockUserId,
        role: 'isStudent',
        value: false,
      });

      await waitFor(() => {
        expect(result.current.updateRole.isPending).toBe(false);
      });

      expect(mockPut).toHaveBeenCalledWith(`/api/users/${mockUserId}`, {
        isStudent: false,
      });
    });

    it('should handle updateRole error', async () => {
      const error = new Error('Failed to update role');
      mockPut.mockRejectedValueOnce(error);

      const { result } = renderHook(() => useUserMutations(), {
        wrapper: createWrapper(),
      });

      result.current.updateRole.mutate({
        id: mockUserId,
        role: 'isAdmin',
        value: true,
      });

      await waitFor(() => {
        expect(result.current.updateRole.error).toEqual(error);
      });
    });
  });

  describe('hook structure', () => {
    it('should return all mutation operations', () => {
      const { result } = renderHook(() => useUserMutations(), {
        wrapper: createWrapper(),
      });

      expect(result.current).toHaveProperty('create');
      expect(result.current).toHaveProperty('update');
      expect(result.current).toHaveProperty('delete');
      expect(result.current).toHaveProperty('updateRole');

      expect(result.current.create).toHaveProperty('mutate');
      expect(result.current.create).toHaveProperty('isPending');
      expect(result.current.create).toHaveProperty('error');

      expect(result.current.update).toHaveProperty('mutate');
      expect(result.current.update).toHaveProperty('isPending');
      expect(result.current.update).toHaveProperty('error');

      expect(result.current.delete).toHaveProperty('mutate');
      expect(result.current.delete).toHaveProperty('isPending');
      expect(result.current.delete).toHaveProperty('error');

      expect(result.current.updateRole).toHaveProperty('mutate');
      expect(result.current.updateRole).toHaveProperty('isPending');
      expect(result.current.updateRole).toHaveProperty('error');
    });

    it('should initialize with no pending operations', () => {
      const { result } = renderHook(() => useUserMutations(), {
        wrapper: createWrapper(),
      });

      expect(result.current.create.isPending).toBe(false);
      expect(result.current.update.isPending).toBe(false);
      expect(result.current.delete.isPending).toBe(false);
      expect(result.current.updateRole.isPending).toBe(false);
    });

    it('should initialize with no errors', () => {
      const { result } = renderHook(() => useUserMutations(), {
        wrapper: createWrapper(),
      });

      expect(result.current.create.error).toBeNull();
      expect(result.current.update.error).toBeNull();
      expect(result.current.delete.error).toBeNull();
      expect(result.current.updateRole.error).toBeNull();
    });
  });
});
