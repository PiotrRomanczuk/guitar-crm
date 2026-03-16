'use client';

import useSongList from '@/components/songs/hooks/useSongList';
import { useAuth } from '@/components/auth/AuthProvider';
import { SongListV2 } from './SongList';

/**
 * Page-level v2 song list client component.
 * Reuses the existing useSongList hook for data fetching.
 * Renders SongListV2 which switches between mobile/desktop.
 */
export function SongListPageV2() {
  const { isTeacher, isAdmin } = useAuth();
  const { songs, loading, error, refresh } = useSongList();

  return (
    <SongListV2
      songs={songs}
      loading={loading}
      error={error}
      isTeacher={isTeacher || isAdmin}
      onRefresh={refresh}
    />
  );
}
