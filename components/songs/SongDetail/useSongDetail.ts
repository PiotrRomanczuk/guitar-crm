'use client';

import { useEffect, useState, useCallback } from 'react';
import { getSupabaseBrowserClient } from '@/lib/supabase-browser';
import { useRouter } from 'next/navigation';
import type { Song } from '../types';

export function useSongDetail(songId: string, onDeleted?: () => void) {
  const [song, setSong] = useState<Song | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [deleting, setDeleting] = useState(false);
  const router = useRouter();

  const loadSong = useCallback(async () => {
    if (!songId) {
      // If no ID yet (e.g., during hydration), skip without changing state.
      // Keep loading=true so UI doesn't flash an error.
      return;
    }

    setLoading(true);
    setError(null);

    try {
      const supabase = getSupabaseBrowserClient();
      const { data, error: fetchError } = await supabase
        .from('songs')
        .select('*')
        .eq('id', songId)
        .single();

      if (fetchError || !data) {
        // Treat PostgREST 406/404 style as not found
        setError('Song not found');
        setSong(null);
        return;
      }

      setSong(data as Song);
    } catch {
      setError('Failed to load song');
      setSong(null);
    } finally {
      setLoading(false);
    }
  }, [songId]);

  useEffect(() => {
    loadSong();
  }, [loadSong]);

  const handleDelete = async () => {
    if (!song || !window.confirm('Are you sure you want to delete this song?')) {
      return;
    }

    setDeleting(true);

    try {
      const supabase = getSupabaseBrowserClient();
      const { error: deleteError } = await supabase.from('songs').delete().eq('id', song.id);

      if (deleteError) {
        setError('Failed to delete song');
        return;
      }

      onDeleted?.();
      router.push('/dashboard/songs');
    } catch {
      setError('Failed to delete song');
    } finally {
      setDeleting(false);
    }
  };

  return {
    song,
    loading,
    error,
    deleting,
    handleDelete,
  };
}
