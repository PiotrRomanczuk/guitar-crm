'use server';

import React from 'react';
import SongDetailHeader from './Header';
import SongDetailInfo from './Info';
import SongDetailActions from './Actions';
import type { Song } from '../types';
import { createClient } from '@/lib/supabase/server';

interface Props {
  songId: string;
  isAdmin?: boolean;
  isTeacher?: boolean;
}

async function loadSongData(songId: string): Promise<Song | null> {
  try {
    console.log('[SongDetail Server] Loading song directly from Supabase:', songId);

    const supabase = await createClient();

    const { data, error } = await supabase
      .from('songs')
      .select('*')
      .eq('id', songId)
      .is('deleted_at', null)
      .single();

    if (error) {
      console.error('[SongDetail Server] Supabase error:', error);
      return null;
    }

    if (!data) {
      console.log('[SongDetail Server] Song not found:', songId);
      return null;
    }

    console.log('[SongDetail Server] Song loaded:', data.id, data.title);
    return data as Song;
  } catch (err) {
    console.error('[SongDetail Server] Exception:', err);
    return null;
  }
}

export default async function SongDetail({
  songId,
  isAdmin = false,
  isTeacher = false,
}: Props) {
  console.log('[SongDetail Server Component] Rendering songId:', songId);

  const song = await loadSongData(songId);

  console.log('[SongDetail Server Component] Got song data:', !!song);

  if (!song) {
    return (
      <div className="bg-red-50 border border-red-200 rounded-lg p-4 text-red-800">
        <p className="font-semibold mb-2">Error Loading Song</p>
        <p className="text-sm mb-3">Song not found or you do not have permission to view it</p>
      </div>
    );
  }

  return (
    <div className="max-w-2xl mx-auto py-6">
      <SongDetailHeader title={song.title || 'Untitled'} author={song.author || 'Unknown'} />
      <SongDetailInfo song={song} />
      <SongDetailActions
        songId={song.id}
        isAdmin={isAdmin}
        isTeacher={isTeacher}
      />
    </div>
  );
}
