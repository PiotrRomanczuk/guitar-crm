'use client';

import { useMutation } from '@tanstack/react-query';
import { getSupabaseBrowserClient } from '@/lib/supabase-browser';
import { useRouter } from 'next/navigation';
import { queryClient } from '@/lib/query-client';
import { apiClient } from '@/lib/api-client';
import type { Song } from '../types';
import { useEffect, useState } from 'react';
import { logger } from '@/lib/logger';

interface DeleteResult {
  success: boolean;
  cascadeInfo?: Record<string, number>;
  error?: string;
}

async function loadSongDetail(songId: string): Promise<Song | undefined> {
  if (!songId) {
    logger.info('[SongDetail] No songId provided');
    return undefined;
  }

  logger.info('[SongDetail] Starting to load song', { songId });

  try {
    const supabase = getSupabaseBrowserClient();
    logger.info('[SongDetail] Supabase client created');

    logger.info('[SongDetail] Checking session...');
    const { data: sessionData } = await supabase.auth.getSession();
    logger.info('[SongDetail] Session data', {
      status: sessionData.session ? 'AUTHENTICATED' : 'NOT_AUTHENTICATED',
    });

    if (!sessionData.session) {
      logger.error('[SongDetail] No session found');
      throw new Error('Not authenticated. Please sign in.');
    }

    logger.info('[SongDetail] User ID', { userId: sessionData.session.user.id });

    logger.info('[SongDetail] Querying songs table', { songId });
    const { data, error: fetchError } = await supabase
      .from('songs')
      .select('*')
      .eq('id', songId)
      .is('deleted_at', null)
      .single();

    logger.info('[SongDetail] Query response', { data: !!data, error: !!fetchError });

    if (fetchError) {
      logger.error('[SongDetail] Supabase error', fetchError, {
        code: fetchError.code,
        message: fetchError.message,
        details: fetchError.details,
        hint: fetchError.hint,
      });

      if (fetchError.code === 'PGRST116') {
        logger.error('[SongDetail] Error PGRST116: No rows found');
        throw new Error('Song not found or has been deleted');
      } else if (fetchError.code === 'PGRST501') {
        logger.error('[SongDetail] Error PGRST501: RLS policy blocked access');
        throw new Error('You do not have permission to view this song');
      }

      throw new Error(fetchError.message || 'Failed to load song');
    }

    if (!data) {
      logger.error('[SongDetail] No data returned');
      throw new Error('Song not found');
    }

    logger.info('[SongDetail] Song loaded successfully', { id: data.id, title: data.title });
    return data as Song;
  } catch (err) {
    logger.error('[SongDetail] Error in loadSongDetail', err);
    throw err;
  }
}

async function deleteSongDetail(songId: string): Promise<DeleteResult> {
  return await apiClient.delete<DeleteResult>(`/api/song?id=${songId}`);
}

export function useSongDetail(songId: string, onDeleted?: () => void) {
  const router = useRouter();
  const [localData, setLocalData] = useState<Song | null>(null);
  const [localLoading, setLocalLoading] = useState(true);
  const [localError, setLocalError] = useState<string | null>(null);
  const [lastFetchedId, setLastFetchedId] = useState<string | null>(null);

  logger.debug('[useSongDetail] RENDER START', { songId, lastFetchedId });

  const shouldFetch = songId && songId !== lastFetchedId;

  logger.debug('[useSongDetail] RENDER', { shouldFetch });

  useEffect(() => {
    logger.debug('[useSongDetail] VERIFICATION EFFECT - useEffect running');
    return () => {
      logger.debug('[useSongDetail] VERIFICATION CLEANUP');
    };
  }, []);

  useEffect(() => {
    if (!shouldFetch) {
      logger.debug('[useSongDetail] DATA FETCH EFFECT - Skipping (already fetched or no songId)');
      return;
    }

    logger.debug('[useSongDetail] DATA FETCH EFFECT - Starting fetch', { songId });

    setLastFetchedId(songId);
    setLocalLoading(true);
    setLocalError(null);

    let isMounted = true;

    const fetchData = async () => {
      try {
        logger.debug('[useSongDetail] ASYNC - Calling loadSongDetail', { songId });
        const data = await loadSongDetail(songId);
        logger.debug('[useSongDetail] ASYNC - Got response', { dataExists: !!data });

        if (isMounted) {
          logger.debug('[useSongDetail] ASYNC - Setting local state');
          setLocalData(data || null);
          setLocalError(null);
          setLocalLoading(false);
        }
      } catch (err) {
        const errorMsg = err instanceof Error ? err.message : String(err);
        logger.error('[useSongDetail] ASYNC - Error', err);

        if (isMounted) {
          setLocalError(errorMsg);
          setLocalData(null);
          setLocalLoading(false);
        }
      }
    };

    fetchData();

    return () => {
      logger.debug('[useSongDetail] DATA FETCH CLEANUP - Component unmounting');
      isMounted = false;
    };
  }, [shouldFetch, songId, lastFetchedId]);

  const { mutate: deleteSong, isPending: deleting } = useMutation({
    mutationFn: (id: string) => deleteSongDetail(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['songs'] });
      onDeleted?.();
      router.push('/dashboard/songs');
    },
  });

  const handleDelete = () => {
    if (!localData || !window.confirm('Are you sure you want to delete this song?')) {
      return;
    }
    deleteSong(localData.id);
  };

  const refetch = () => {
    logger.debug('[useSongDetail] REFETCH - refetch() called', { songId });
    setLocalLoading(true);
    setLocalError(null);

    let isMounted = true;

    const fetchSong = async () => {
      try {
        logger.debug('[useSongDetail] REFETCH - Starting fetch');
        const data = await loadSongDetail(songId);
        if (isMounted) {
          logger.debug('[useSongDetail] REFETCH - Setting data');
          setLocalData(data || null);
          setLocalError(null);
        }
      } catch (err) {
        const errorMsg = err instanceof Error ? err.message : String(err);
        logger.error('[useSongDetail] REFETCH - Error', err);
        if (isMounted) {
          setLocalError(errorMsg);
          setLocalData(null);
        }
      } finally {
        if (isMounted) {
          setLocalLoading(false);
        }
      }
    };

    fetchSong();

    return () => {
      isMounted = false;
    };
  };

  logger.debug('[useSongDetail] RETURN - returning state', {
    song: localData ? { id: localData.id, title: localData.title } : null,
    loading: localLoading,
    error: localError,
  });

  return {
    song: localData,
    loading: localLoading,
    error: localError,
    deleting,
    handleDelete,
    refetch,
  };
}
