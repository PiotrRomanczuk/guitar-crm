'use client';

import { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { useAuth } from '@/components/auth/AuthProvider';
import { apiClient } from '@/lib/api-client';
import type { SongWithStatus, SongFilters } from '../types';
import { buildSongFilterParams, getSongEndpoint } from './useSongList.helpers';

export default function useSongList() {
  const { user, isTeacher, isAdmin, loading: authLoading } = useAuth();
  const [filters, setFilters] = useState<SongFilters>({ level: null });

  const {
    data: songs = [],
    isLoading,
    error,
    refetch,
  } = useQuery({
    queryKey: ['songs', user?.id, filters, isAdmin, isTeacher],
    queryFn: async () => {
      if (!user?.id) {
        throw new Error('Not authenticated');
      }

      const params = buildSongFilterParams(user.id, filters);
      const endpoint = getSongEndpoint(isAdmin, isTeacher);

      return apiClient.get<SongWithStatus[]>(`${endpoint}?${params}`);
    },
    enabled: !authLoading && !!user?.id,
  });

  return {
    songs,
    loading: authLoading || isLoading,
    error: error ? (error instanceof Error ? error.message : 'Failed to load songs') : null,
    filters,
    setFilters,
    refresh: refetch,
  };
}
