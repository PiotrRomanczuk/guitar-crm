'use client';

import { useQuery } from '@tanstack/react-query';
import { apiClient } from '@/lib/api-client';

export interface Song {
  id: string;
  title: string;
  author: string;
}

export function useSongs() {
  const {
    data: songs = [],
    isLoading,
    error,
  } = useQuery({
    queryKey: ['songs-list-simple'],
    queryFn: async () => {
      // We use admin-songs endpoint as it returns all songs for teachers/admins
      // We might need to adjust this if we want to filter by what the teacher can see
      return apiClient.get<Song[]>('/api/song/admin-songs');
    },
  });

  return {
    songs,
    loading: isLoading,
    error: error ? (error instanceof Error ? error.message : 'Failed to load songs') : null,
  };
}
