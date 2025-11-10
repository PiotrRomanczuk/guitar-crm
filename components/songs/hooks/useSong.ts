'use client';

import { useEffect, useState } from 'react';
import { getSupabaseBrowserClient } from '@/lib/supabase-browser';
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
  const [song, setSong] = useState<Song | undefined>(undefined);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [deleting, setDeleting] = useState(false);

  useEffect(() => {
    async function loadSong() {
      if (!songId) {
        setSong(undefined);
        setLoading(false);
        setError(null);
        return;
      }

      setLoading(true);
      try {
        const supabase = getSupabaseBrowserClient();
        const { data, error: fetchError } = await supabase
          .from('songs')
          .select('*')
          .eq('id', songId)
          .is('deleted_at', null) // Only load non-deleted songs
          .single();

        if (fetchError) {
          setError('Failed to load song');
          return;
        }

        setSong(data);
      } catch {
        setError('Failed to load song');
      } finally {
        setLoading(false);
      }
    }

    loadSong();
  }, [songId]);

  const deleteSong = async (songId: string): Promise<DeleteResult> => {
    setDeleting(true);
    try {
      const response = await fetch(`/api/song?id=${songId}`, {
        method: 'DELETE',
      });

      const result = await response.json();

      if (!response.ok) {
        return { success: false, error: result.error };
      }

      return {
        success: true,
        cascadeInfo: result.cascadeInfo,
      };
    } catch {
      return { success: false, error: 'Network error occurred' };
    } finally {
      setDeleting(false);
    }
  };

  return { song, loading, error, deleting, deleteSong };
}
