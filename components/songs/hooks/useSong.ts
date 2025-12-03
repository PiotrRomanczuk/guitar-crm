'use client';

import { useQuery, useMutation } from '@tanstack/react-query';
import { getSupabaseBrowserClient } from '@/lib/supabase-browser';
import { queryClient } from '@/lib/query-client';
import { apiClient } from '@/lib/api-client';
import { Song } from '@/schemas/SongSchema';

interface DeleteResult {
  success: boolean;
  cascadeInfo?: {
    lesson_assignments_removed: number;
    favorite_assignments_removed: number;
  };
  error?: string;
}

async function loadSongFromDb(songId: string): Promise<Song | undefined> {
  if (!songId) {
    return undefined;
  }

  const supabase = getSupabaseBrowserClient();
  const { data, error: fetchError } = await supabase
    .from('songs')
    .select('*')
    .eq('id', songId)
    .is('deleted_at', null) // Only load non-deleted songs
    .single();

  if (fetchError) {
    throw new Error('Failed to load song');
  }

  return data;
}

async function deleteSongFromApi(songId: string): Promise<DeleteResult> {
  const result = await apiClient.delete<DeleteResult>(`/api/song?id=${songId}`);
  return result;
}

export default function useSong(songId: string) {
  // Query for fetching song
  const {
    data: song,
    isLoading,
    error,
  } = useQuery({
    queryKey: ['songs', songId],
    queryFn: () => loadSongFromDb(songId),
    enabled: !!songId,
    staleTime: 1000 * 60 * 5, // 5 minutes
  });

  // Mutation for deleting song
  const { mutate: deleteSong, isPending: deleting } = useMutation({
    mutationFn: (id: string) => deleteSongFromApi(id),
    onSuccess: () => {
      // Invalidate all song queries
      queryClient.invalidateQueries({ queryKey: ['songs'] });
    },
  });

  return {
    song,
    loading: isLoading,
    error: error ? (error instanceof Error ? error.message : 'Failed to load song') : null,
    deleting,
    deleteSong: (id: string) => deleteSong(id),
  };
}
