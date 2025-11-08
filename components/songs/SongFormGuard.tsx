'use client';

import React from 'react';
import { RequireTeacher } from '@/components/auth/RequireRole';
import SongForm from './SongForm';
import { useSong } from './hooks';
import { useRouter } from 'next/navigation';

interface Props {
  mode: 'create' | 'edit';
  songId?: string;
  onSuccess?: () => void;
}

export default function SongFormGuard({ mode, songId, onSuccess }: Props) {
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

  return (
    <RequireTeacher
      loadingComponent={
        <div className="min-h-screen flex items-center justify-center">
          <div className="text-xl text-gray-600">Loading...</div>
        </div>
      }
    >
      <SongForm mode={mode} song={song} onSuccess={handleSuccess} />
    </RequireTeacher>
  );
}
