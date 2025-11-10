'use client';

import { useMutation } from '@tanstack/react-query';
import { queryClient } from '@/lib/query-client';
import { apiClient } from '@/lib/api-client';
import type { Lesson } from '@/schemas/LessonSchema';
import { LessonInputSchema } from '@/schemas/LessonSchema';
import { z } from 'zod';

interface DeleteResult {
  success: boolean;
  cascadeInfo?: Record<string, number>;
  error?: string;
}

interface CreateLessonPayload {
  data: z.infer<typeof LessonInputSchema>;
}

interface UpdateLessonPayload {
  id: string;
  data: z.infer<typeof LessonInputSchema>;
}

interface DeleteLessonPayload {
  id: string;
}

async function createLesson(payload: CreateLessonPayload): Promise<Lesson> {
  return await apiClient.post<Lesson>('/api/lessons', payload.data);
}

async function updateLesson(payload: UpdateLessonPayload): Promise<Lesson> {
  return await apiClient.put<Lesson>(`/api/lessons/${payload.id}`, payload.data);
}

async function deleteLesson(payload: DeleteLessonPayload): Promise<DeleteResult> {
  return await apiClient.delete<DeleteResult>(`/api/lessons/${payload.id}`);
}

/**
 * Centralized mutations for Lesson CRUD operations
 * Handles create, update, and delete with automatic cache invalidation
 */
export function useLessonMutations() {
  const createMutation = useMutation({
    mutationFn: createLesson,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['lessons'] });
    },
  });

  const updateMutation = useMutation({
    mutationFn: updateLesson,
    onSuccess: (lesson) => {
      // Invalidate both list and detail queries
      queryClient.invalidateQueries({ queryKey: ['lessons'] });
      queryClient.setQueryData(['lessons', lesson.id], lesson);
    },
  });

  const deleteMutation = useMutation({
    mutationFn: deleteLesson,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['lessons'] });
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
