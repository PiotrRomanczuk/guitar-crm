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
    console.log('[useSong-Effect] Effect started for:', songId);

    if (!songId) {
      setLoading(false);
      return;
    }

    const fetchSong = async () => {
      try {
        console.log('[useSong-Effect] Fetching...');

        // TEST: Raw fetch to rule out Supabase client library issues
        const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
        const supabaseKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

        if (!supabaseUrl || !supabaseKey) {
          throw new Error('Missing Supabase env vars');
        }

        // Get the session token for RLS
        const supabase = getSupabaseBrowserClient();

        console.log('[useSong-Effect] Getting session...');

        let accessToken = null;

        // Strategy 1: getSession with timeout
        try {
          console.log('[useSong-Effect] Strategy 1: getSession');
          const sessionPromise = supabase.auth.getSession();
          const sessionTimeout = new Promise((_, reject) =>
            setTimeout(() => reject('timeout'), 5000)
          );
          const result = (await Promise.race([sessionPromise, sessionTimeout])) as any;

          if (result?.data?.session?.access_token) {
            console.log('[useSong-Effect] Got token from getSession');
            accessToken = result.data.session.access_token;
          }
        } catch (e) {
          console.warn('[useSong-Effect] getSession timed out or failed:', e);
        }

        // Strategy 2: refreshSession if no token
        if (!accessToken) {
          console.log('[useSong-Effect] Strategy 2: refreshSession');
          try {
            const { data } = await supabase.auth.refreshSession();
            if (data?.session?.access_token) {
              console.log('[useSong-Effect] Got token from refreshSession');
              accessToken = data.session.access_token;
            }
          } catch (e) {
            console.error('[useSong-Effect] refreshSession failed', e);
          }
        }

        const authHeader = accessToken ? `Bearer ${accessToken}` : `Bearer ${supabaseKey}`;

        console.log('[useSong-Effect] Auth status:', accessToken ? 'Authenticated' : 'Anonymous');
        console.log('[useSong-Effect] Attempting RAW FETCH to:', `${supabaseUrl}/rest/v1/songs`);

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
          console.log('[useSong-Effect] Fetch response data length:', data ? data.length : 'null');

          if (data && data.length > 0) {
            console.log('[useSong-Effect] Song found:', data[0].title);
            setSong(data[0]);
          } else {
            console.warn(
              '[useSong-Effect] Song not found or empty response. Response:',
              JSON.stringify(data)
            );
            setSong(undefined);
          }
          setLoading(false);
          return; // Exit if raw fetch works
        } catch (fetchErr: any) {
          console.error('[useSong-Effect] Raw fetch failed:', fetchErr);
          // If raw fetch fails, we can try the client or just report error
          throw fetchErr;
        }

        /*
        const supabase = getSupabaseBrowserClient();
        
        // Timeout for the whole operation
        const timeoutPromise = new Promise((_, reject) => 
          setTimeout(() => reject(new Error('Manual fetch timeout')), 5000)
        );

        const fetchPromise = supabase
          .from('songs')
          .select('*')
          .eq('id', songId)
          .single();

        const { data, error: fetchError } = await Promise.race([fetchPromise, timeoutPromise]) as any;

        if (!mounted) return;

        if (fetchError) {
          console.error('[useSong-Effect] Error:', fetchError);
          setError(fetchError.message);
        } else {
          console.log('[useSong-Effect] Success:', data);
          setSong(data);
        }
        */
      } catch (err: any) {
        if (!mounted) return;
        console.error('[useSong-Effect] Catch:', err);
        setError(err.message || 'Unknown error');
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
