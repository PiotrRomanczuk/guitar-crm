'use client';

import { useMutation, useQuery } from '@tanstack/react-query';
import { getSupabaseBrowserClient } from '@/lib/supabase-browser';
import { useRouter } from 'next/navigation';
import { queryClient } from '@/lib/query-client';
import { apiClient } from '@/lib/api-client';
import type { Song } from '../types';

interface DeleteResult {
  success: boolean;
  cascadeInfo?: Record<string, number>;
  error?: string;
}

async function loadSongDetail(songId: string): Promise<Song | undefined> {
  if (!songId) return undefined;

  const supabase = getSupabaseBrowserClient();
  const { data, error: fetchError } = await supabase
    .from('songs')
    .select('*')
    .eq('id', songId)
    .single();

  if (fetchError || !data) {
    throw new Error('Song not found');
  }

  return data as Song;
}

async function deleteSongDetail(songId: string): Promise<DeleteResult> {
  return await apiClient.delete<DeleteResult>(`/api/song?id=${songId}`);
}

export function useSongDetail(songId: string, onDeleted?: () => void) {
  const router = useRouter();

  const {
    data: song,
    isLoading,
    error,
    refetch,
  } = useQuery({
    queryKey: ['songs', songId],
    queryFn: () => loadSongDetail(songId),
    enabled: !!songId,
    staleTime: 1000 * 60 * 5,
  });

  const { mutate: deleteSong, isPending: deleting } = useMutation({
    mutationFn: (id: string) => deleteSongDetail(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['songs'] });
      onDeleted?.();
      router.push('/dashboard/songs');
    },
  });

  const handleDelete = () => {
    if (!song || !window.confirm('Are you sure you want to delete this song?')) {
      return;
    }
    deleteSong(song.id);
  };

  return {
    song,
    loading: isLoading,
    error: error ? (error instanceof Error ? error.message : 'Failed to load song') : null,
    deleting,
    handleDelete,
    refetch,
  };
}
