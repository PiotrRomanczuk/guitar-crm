'use client';

import React from 'react';
import SongForm from './SongForm';
import { useSong } from './hooks';
import { useRouter } from 'next/navigation';

interface Props {
  mode: 'create' | 'edit';
  songId?: string;
  onSuccess?: () => void;
}

export default function SongFormGuard({ mode, songId, onSuccess }: Props) {
  // NOTE: SSR roles should be passed in from parent in future; for now we optimistically allow admin-only client side by reading a global injected flag.
  // TODO: Accept an isAdmin prop from parent SSR component instead of relying on fallback.
  // Fallback: show form; server-side API will still enforce authorization.
  const router = useRouter();
  const { song, loading, error } = useSong(songId || '');

  if (mode === 'edit' && loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-xl text-gray-600">Loading...</div>
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
