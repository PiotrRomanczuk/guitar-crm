'use client';

import React, { useEffect } from 'react';
import SongForm from './SongForm';
import { useSong } from './hooks';
import { useRouter } from 'next/navigation';
import { logger } from '@/lib/logger';

interface Props {
  mode: 'create' | 'edit';
  songId?: string;
  onSuccess?: () => void;
}

export default function SongFormGuard({ mode, songId, onSuccess }: Props) {
  // Server-side API enforces authorization; client renders form optimistically.
  const router = useRouter();

  useEffect(() => {
    logger.info('[SongFormGuard] Component MOUNTED on client', { mode, songId });
  }, [mode, songId]);

  logger.info('[SongFormGuard] Rendering with props:', { mode, songId });

  const { song, loading, error } = useSong(songId || '');
  logger.info('[SongFormGuard] useSong hook result:', { song, loading, error });

  if (mode === 'edit' && loading) {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center gap-4">
        <div className="text-xl text-gray-600">Loading...</div>
        <div className="p-4 bg-gray-100 rounded text-xs font-mono max-w-lg break-all border border-gray-300">
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
        <div className="text-xl text-red-600">Error: {error}</div>
      </div>
    );
  }

  const handleSuccess = onSuccess ?? (() => router.push('/dashboard/songs'));

  return <SongForm mode={mode} song={song} onSuccess={handleSuccess} />;
}
