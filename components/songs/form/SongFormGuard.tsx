'use client';

import React, { useEffect } from 'react';
import SongForm from '.';
import { useSong } from '../hooks';
import { useRouter } from 'next/navigation';

interface Props {
  mode: 'create' | 'edit';
  songId?: string;
  onSuccess?: (songId?: string) => void;
}

export default function SongFormGuard({ mode, songId, onSuccess }: Props) {
  // NOTE: SSR roles should be passed in from parent in future; for now we optimistically allow admin-only client side by reading a global injected flag.
  // TODO: Accept an isAdmin prop from parent SSR component instead of relying on fallback.
  // Fallback: show form; server-side API will still enforce authorization.
  const router = useRouter();

  useEffect(() => {
    console.log('[SongFormGuard] Component MOUNTED on client', { mode, songId });
  }, [mode, songId]);

  console.log('[SongFormGuard] Rendering with props:', { mode, songId });

  const { song, loading, error } = useSong(songId || '');
  console.log('[SongFormGuard] useSong hook result:', { song, loading, error });

  if (mode === 'edit' && loading) {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center gap-4">
        <div className="text-xl text-muted-foreground">Loading...</div>
        <div className="p-4 bg-muted rounded text-xs font-mono max-w-lg break-all border border-border">
          <p className="font-bold mb-2">Debug Info:</p>
          <p>Song ID: {songId}</p>
          <p>Loading: {String(loading)}</p>
          <p>Error: {String(error)}</p>
          <p>Supabase URL: {process.env.NEXT_PUBLIC_SUPABASE_URL ? 'Defined' : 'Missing'}</p>
          <p>Supabase Key: {process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY ? 'Defined' : 'Missing'}</p>
          <p>Timestamp: {new Date().toISOString()}</p>
        </div>
      </div>
    );
  }

  if (mode === 'edit' && error) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-xl text-destructive">Error: {error}</div>
      </div>
    );
  }

  const handleSuccess = (songId?: string) => {
    if (onSuccess) {
      onSuccess(songId);
    } else if (songId) {
      router.push(`/dashboard/songs/${songId}`);
    } else {
      router.push('/dashboard/songs');
    }
  };

  return <SongForm mode={mode} song={song} onSuccess={handleSuccess} />;
}
