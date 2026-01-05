'use client';

import { useMutation, useQueryClient } from '@tanstack/react-query';
import { apiClient } from '@/lib/api-client';
import type { Song } from '@/schemas/SongSchema';
import { SongInputSchema, SongUpdateSchema } from '@/schemas/SongSchema';
import { z } from 'zod';

interface DeleteResult {
  success: boolean;
  cascadeInfo?: Record<string, number>;
  error?: string;
}

interface CreateSongPayload {
  data: z.infer<typeof SongInputSchema>;
}

interface UpdateSongPayload {
  id: string;
  data: z.infer<typeof SongUpdateSchema>;
}

interface DeleteSongPayload {
  id: string;
}

async function createSong(payload: CreateSongPayload): Promise<Song> {
  return await apiClient.post<Song>('/api/song', payload.data);
}

async function updateSong(payload: UpdateSongPayload): Promise<Song> {
  return await apiClient.put<Song>(`/api/song?id=${payload.id}`, payload.data);
}

async function deleteSong(payload: DeleteSongPayload): Promise<DeleteResult> {
  return await apiClient.delete<DeleteResult>(`/api/song?id=${payload.id}`);
}

/**
 * Centralized mutations for Song CRUD operations
 * Handles create, update, and delete with automatic cache invalidation
 */
export function useSongMutations() {
  const queryClient = useQueryClient();

  const createMutation = useMutation({
    mutationFn: createSong,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['songs'] });
    },
  });

  const updateMutation = useMutation({
    mutationFn: updateSong,
    onSuccess: (song) => {
      // Invalidate both list and detail queries
      queryClient.invalidateQueries({ queryKey: ['songs'] });
      queryClient.setQueryData(['songs', song.id], song);
    },
  });

  const deleteMutation = useMutation({
    mutationFn: deleteSong,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['songs'] });
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
