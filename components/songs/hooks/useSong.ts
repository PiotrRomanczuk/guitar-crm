'use client';

import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { getSupabaseBrowserClient } from '@/lib/supabase-browser';
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

export default function useSong(songId: string) {
  const queryClient = useQueryClient();

  const {
    data: song,
    isLoading: loading,
    error: queryError,
  } = useQuery({
    queryKey: ['song', songId],
    queryFn: async () => {
      const supabase = getSupabaseBrowserClient();
      const { data, error } = await supabase
        .from('songs')
        .select('*')
        .eq('id', songId)
        .single();

      if (error) throw new Error(error.message);
      return data as Song;
    },
    enabled: !!songId,
  });

  const { mutate: deleteSong, isPending: deleting } = useMutation({
    mutationFn: async (id: string) => {
      const result = await apiClient.delete<DeleteResult>(`/api/song?id=${id}`);
      return result;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['songs'] });
      queryClient.invalidateQueries({ queryKey: ['song', songId] });
    },
  });

  return {
    song,
    loading,
    error: queryError?.message ?? null,
    deleting,
    deleteSong: (id: string) => deleteSong(id),
  };
}
