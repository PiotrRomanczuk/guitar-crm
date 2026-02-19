'use client';

import { useState, useEffect } from 'react';
import { useMutation, useQueryClient } from '@tanstack/react-query';
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

// Temporary manual fetch to debug React Query issues
export default function useSong(songId: string) {
  const [song, setSong] = useState<Song | undefined>(undefined);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const queryClient = useQueryClient();

  useEffect(() => {
    let mounted = true;

    if (!songId) {
      setLoading(false);
      return;
    }

    const fetchSong = async () => {
      try {
        const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
        const supabaseKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

        if (!supabaseUrl || !supabaseKey) {
          throw new Error('Missing Supabase env vars');
        }

        // Get the session token for RLS
        const supabase = getSupabaseBrowserClient();

        let accessToken = null;

        // Strategy 1: getSession with timeout
        try {
          const sessionPromise = supabase.auth.getSession();
          const sessionTimeout = new Promise((_, reject) =>
            setTimeout(() => reject('timeout'), 5000)
          );
          const result = (await Promise.race([sessionPromise, sessionTimeout])) as {
            data: { session: { access_token: string } | null } | null;
          };

          if (result?.data?.session?.access_token) {
            accessToken = result.data.session.access_token;
          }
        } catch {
          // getSession timed out or failed, will try refreshSession
        }

        // Strategy 2: refreshSession if no token
        if (!accessToken) {
          try {
            const { data } = await supabase.auth.refreshSession();
            if (data?.session?.access_token) {
              accessToken = data.session.access_token;
            }
          } catch {
            // refreshSession failed
          }
        }

        const authHeader = accessToken ? `Bearer ${accessToken}` : `Bearer ${supabaseKey}`;

        const controller = new AbortController();
        const timeoutId = setTimeout(() => controller.abort(), 5000);

        try {
          const response = await fetch(`${supabaseUrl}/rest/v1/songs?id=eq.${songId}&select=*`, {
            headers: {
              apikey: supabaseKey,
              Authorization: authHeader,
              'Content-Type': 'application/json',
            },
            signal: controller.signal,
          });

          clearTimeout(timeoutId);

          if (!response.ok) {
            throw new Error(`Raw fetch failed: ${response.status} ${response.statusText}`);
          }

          const data = await response.json();

          if (data && data.length > 0) {
            setSong(data[0]);
          } else {
            setSong(undefined);
          }
          setLoading(false);
          return; // Exit if raw fetch works
        } catch (fetchErr: unknown) {
          throw fetchErr;
        }
      } catch (err: unknown) {
        if (!mounted) return;
        setError(err instanceof Error ? err.message : 'Unknown error');
      } finally {
        if (mounted) {
          setLoading(false);
        }
      }
    };

    fetchSong();

    return () => {
      mounted = false;
    };
  }, [songId]);

  // Mutation for deleting song
  const { mutate: deleteSong, isPending: deleting } = useMutation({
    mutationFn: async (id: string) => {
      const result = await apiClient.delete<DeleteResult>(`/api/song?id=${id}`);
      return result;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['songs'] });
    },
  });

  return {
    song,
    loading,
    error,
    deleting,
    deleteSong: (id: string) => deleteSong(id),
  };
}
