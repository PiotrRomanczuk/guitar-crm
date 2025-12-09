'use client';

import { useMutation } from '@tanstack/react-query';
import { getSupabaseBrowserClient } from '@/lib/supabase-browser';
import { useRouter } from 'next/navigation';
import { queryClient } from '@/lib/query-client';
import { apiClient } from '@/lib/api-client';
import type { Song } from '../types';
import { useEffect, useState } from 'react';

interface DeleteResult {
  success: boolean;
  cascadeInfo?: Record<string, number>;
  error?: string;
}

async function loadSongDetail(songId: string): Promise<Song | undefined> {
  if (!songId) {
    console.log('[SongDetail] No songId provided');
    return undefined;
  }

  console.log('[SongDetail] Starting to load song:', songId);

  try {
    const supabase = getSupabaseBrowserClient();
    console.log('[SongDetail] Supabase client created');

    // Verify we have a session before querying
    console.log('[SongDetail] Checking session...');
    const { data: sessionData } = await supabase.auth.getSession();
    console.log(
      '[SongDetail] Session data:',
      sessionData.session ? 'AUTHENTICATED' : 'NOT_AUTHENTICATED'
    );

    if (!sessionData.session) {
      console.error('[SongDetail] No session found');
      throw new Error('Not authenticated. Please sign in.');
    }

    console.log('[SongDetail] User ID:', sessionData.session.user.id);

    // Try to get the song - RLS policies will handle access control
    console.log('[SongDetail] Querying songs table for ID:', songId);
    const { data, error: fetchError } = await supabase
      .from('songs')
      .select('*')
      .eq('id', songId)
      .is('deleted_at', null)
      .single();

    console.log('[SongDetail] Query response:', { data: !!data, error: !!fetchError });

    if (fetchError) {
      console.error('[SongDetail] Supabase error:', {
        code: fetchError.code,
        message: fetchError.message,
        details: fetchError.details,
        hint: fetchError.hint,
        status: fetchError.status,
      });

      // Handle specific Supabase errors
      if (fetchError.code === 'PGRST116') {
        console.error('[SongDetail] Error PGRST116: No rows found');
        throw new Error('Song not found or has been deleted');
      } else if (fetchError.code === 'PGRST501') {
        console.error('[SongDetail] Error PGRST501: RLS policy blocked access');
        throw new Error('You do not have permission to view this song');
      }

      throw new Error(fetchError.message || 'Failed to load song');
    }

    if (!data) {
      console.error('[SongDetail] No data returned');
      throw new Error('Song not found');
    }

    console.log('[SongDetail] Song loaded successfully:', data.id, data.title);
    return data as Song;
  } catch (err) {
    console.error('[SongDetail] Error in loadSongDetail:', err);
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

  console.log(
    '[useSongDetail Hook] RENDER START - songId:',
    songId,
    'lastFetchedId:',
    lastFetchedId
  );

  // Track if we've already attempted to fetch this songId
  const shouldFetch = songId && songId !== lastFetchedId;

  console.log('[useSongDetail Hook] RENDER - shouldFetch:', shouldFetch);

  // First useEffect - just to verify effects are running
  useEffect(() => {
    console.log('[useSongDetail Hook] VERIFICATION EFFECT - This proves useEffect CAN run');
    return () => {
      console.log('[useSongDetail Hook] VERIFICATION CLEANUP - Effect cleanup works');
    };
  }, []);

  // Second useEffect - the actual data fetching
  useEffect(() => {
    if (!shouldFetch) {
      console.log(
        '[useSongDetail Hook] DATA FETCH EFFECT - Skipping (already fetched or no songId)'
      );
      return;
    }

    console.log('[useSongDetail Hook] DATA FETCH EFFECT - Starting fetch for songId:', songId);

    // Mark that we're fetching this ID
    setLastFetchedId(songId);
    setLocalLoading(true);
    setLocalError(null);

    let isMounted = true;

    const fetchData = async () => {
      try {
        console.log('[useSongDetail Hook] ASYNC - Calling loadSongDetail for:', songId);
        const data = await loadSongDetail(songId);
        console.log('[useSongDetail Hook] ASYNC - Got response, data exists:', !!data);

        if (isMounted) {
          console.log('[useSongDetail Hook] ASYNC - Setting local state');
          setLocalData(data || null);
          setLocalError(null);
          setLocalLoading(false);
        }
      } catch (err) {
        const errorMsg = err instanceof Error ? err.message : String(err);
        console.error('[useSongDetail Hook] ASYNC - Error:', errorMsg);

        if (isMounted) {
          setLocalError(errorMsg);
          setLocalData(null);
          setLocalLoading(false);
        }
      }
    };

    fetchData();

    return () => {
      console.log('[useSongDetail Hook] DATA FETCH CLEANUP - Component unmounting');
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
    console.log('[useSongDetail Hook] REFETCH - refetch() called for songId:', songId);
    setLocalLoading(true);
    setLocalError(null);

    let isMounted = true;

    const fetchSong = async () => {
      try {
        console.log('[useSongDetail Hook] REFETCH - Starting fetch');
        const data = await loadSongDetail(songId);
        if (isMounted) {
          console.log('[useSongDetail Hook] REFETCH - Setting data');
          setLocalData(data || null);
          setLocalError(null);
        }
      } catch (err) {
        const errorMsg = err instanceof Error ? err.message : String(err);
        console.error('[useSongDetail Hook] REFETCH - Error:', errorMsg);
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

  console.log('[useSongDetail Hook] RETURN - returning state:', {
    song: !!localData ? { id: localData.id, title: localData.title } : null,
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
