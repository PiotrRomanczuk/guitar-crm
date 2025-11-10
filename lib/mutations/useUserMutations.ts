'use client';

import { useMutation } from '@tanstack/react-query';
import { queryClient } from '@/lib/query-client';
import { apiClient } from '@/lib/api-client';
import type { User } from '@/schemas/UserSchema';

interface DeleteResult {
  success: boolean;
  error?: string;
}

interface CreateUserPayload {
  data: Partial<User>;
}

interface UpdateUserPayload {
  id: string | number;
  data: Partial<User>;
}

interface DeleteUserPayload {
  id: string | number;
}

interface UpdateUserRolePayload {
  id: string | number;
  role: 'isAdmin' | 'isTeacher' | 'isStudent';
  value: boolean;
}

async function createUser(payload: CreateUserPayload): Promise<User> {
  return await apiClient.post<User>('/api/users', payload.data);
}

async function updateUser(payload: UpdateUserPayload): Promise<User> {
  return await apiClient.put<User>(`/api/users/${payload.id}`, payload.data);
}

async function deleteUser(payload: DeleteUserPayload): Promise<DeleteResult> {
  return await apiClient.put<DeleteResult>(`/api/users/${payload.id}`, { isActive: false });
}

async function updateUserRole(payload: UpdateUserRolePayload): Promise<User> {
  return await apiClient.put<User>(`/api/users/${payload.id}`, {
    [payload.role]: payload.value,
  });
}

/**
 * Centralized mutations for User CRUD operations
 * Handles create, update, delete, and role management with automatic cache invalidation
 */
export function useUserMutations() {
  const createMutation = useMutation({
    mutationFn: createUser,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['users'] });
    },
  });

  const updateMutation = useMutation({
    mutationFn: updateUser,
    onSuccess: () => {
      // Invalidate both list and detail queries
      queryClient.invalidateQueries({ queryKey: ['users'] });
      queryClient.invalidateQueries({ queryKey: ['profiles'] });
    },
  });

  const deleteMutation = useMutation({
    mutationFn: deleteUser,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['users'] });
      queryClient.invalidateQueries({ queryKey: ['profiles'] });
    },
  });

  const updateRoleMutation = useMutation({
    mutationFn: updateUserRole,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['users'] });
      queryClient.invalidateQueries({ queryKey: ['profiles'] });
    },
  });

  return {
    create: {
      mutate: createMutation.mutate,
      isPending: createMutation.isPending,
      error: createMutation.error,
    },
    update: {
      mutate: updateMutation.mutate,
      isPending: updateMutation.isPending,
      error: updateMutation.error,
    },
    delete: {
      mutate: deleteMutation.mutate,
      isPending: deleteMutation.isPending,
      error: deleteMutation.error,
    },
    updateRole: {
      mutate: updateRoleMutation.mutate,
      isPending: updateRoleMutation.isPending,
      error: updateRoleMutation.error,
    },
  };
}
