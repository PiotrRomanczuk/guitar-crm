'use client';

import React from 'react';
import SongFormContent from './Content';
import { Song } from '@/schemas/SongSchema';
import { useRouter } from 'next/navigation';

interface Props {
  mode: 'create' | 'edit';
  song?: Song;
  onSuccess?: (songId?: string) => void;
}

export default function SongForm({ mode, song, onSuccess }: Props) {
  const router = useRouter();

  const handleSuccess = (songId?: string) => {
    if (onSuccess) {
      onSuccess(songId);
    } else if (songId) {
      router.push(`/dashboard/songs/${songId}`);
      router.refresh();
    } else {
      router.push('/dashboard/songs');
      router.refresh();
    }
  };

  return (
    <div className="max-w-2xl mx-auto py-6 px-4 sm:px-6">
      <h1 className="text-2xl sm:text-3xl font-bold mb-6 text-gray-900 dark:text-gray-100">
        {mode === 'create' ? 'Create New Song' : 'Edit Song'}
      </h1>
      {/* TODO: Extract submit / mutation logic to dedicated hook (useSongMutations) */}
      <SongFormContent mode={mode} song={song} onSuccess={handleSuccess} />
    </div>
  );
}
