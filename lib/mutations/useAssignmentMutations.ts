'use client';

import { useMutation, useQueryClient } from '@tanstack/react-query';
import { apiClient } from '@/lib/api-client';
import {
  AssignmentSchema,
  AssignmentInputSchema,
  AssignmentUpdateSchema,
} from '@/schemas/AssignmentSchema';
import { z } from 'zod';

type Assignment = z.infer<typeof AssignmentSchema>;

interface DeleteResult {
  success: boolean;
  error?: string;
}

interface CreateAssignmentPayload {
  data: z.infer<typeof AssignmentInputSchema>;
}

interface UpdateAssignmentPayload {
  id: string;
  data: z.infer<typeof AssignmentUpdateSchema>;
}

interface DeleteAssignmentPayload {
  id: string | number;
}

async function createAssignment(payload: CreateAssignmentPayload): Promise<Assignment> {
  return await apiClient.post<Assignment>('/api/assignments', payload.data);
}

async function updateAssignment(payload: UpdateAssignmentPayload): Promise<Assignment> {
  return await apiClient.put<Assignment>(`/api/assignments/${payload.id}`, payload.data);
}

async function deleteAssignment(payload: DeleteAssignmentPayload): Promise<DeleteResult> {
  return await apiClient.delete<DeleteResult>(`/api/assignments/${payload.id}`);
}

/**
 * Centralized mutations for Assignment CRUD operations
 * Handles create, update, and delete with automatic cache invalidation
 */
export function useAssignmentMutations() {
  const queryClient = useQueryClient();

  const createMutation = useMutation({
    mutationFn: createAssignment,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['assignments'] });
    },
  });

  const updateMutation = useMutation({
    mutationFn: updateAssignment,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['assignments'] });
    },
  });

  const deleteMutation = useMutation({
    mutationFn: deleteAssignment,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['assignments'] });
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
  };
}
