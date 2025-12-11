'use client';

import dynamic from 'next/dynamic';
import React from 'react';

const SongFormGuard = dynamic(() => import('./SongFormGuard'), {
  ssr: false,
  loading: () => <div className="p-4 text-gray-500">Loading editor...</div>,
});

interface Props {
  mode: 'create' | 'edit';
  songId?: string;
  onSuccess?: () => void;
}

export default function SongFormGuardWrapper(props: Props) {
  return <SongFormGuard {...props} />;
}
