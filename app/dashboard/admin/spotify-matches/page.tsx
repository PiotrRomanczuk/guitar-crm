import { getUserWithRolesSSR } from '@/lib/getUserWithRolesSSR';
import { redirect } from 'next/navigation';
import { SpotifyMatchesClient } from './SpotifyMatchesClient';
import { createClient } from '@/lib/supabase/server';

export default async function SpotifyMatchesPage() {
  const { user, isAdmin, isTeacher } = await getUserWithRolesSSR();

  if (!user) {
    redirect('/sign-in');
  }

  if (!isAdmin && !isTeacher) {
    redirect('/dashboard');
  }

  // Fetch songs without Spotify data
  const supabase = await createClient();
  const { data: songsWithoutSpotify, error: withoutError } = await supabase
    .from('songs')
    .select('id, title, author, spotify_link_url, cover_image_url, created_at')
    .is('deleted_at', null)
    .is('spotify_link_url', null)
    .order('created_at', { ascending: false })
    .limit(100);

  // Fetch recently synced songs
  const { data: recentlySynced, error: syncedError } = await supabase
    .from('songs')
    .select('id, title, author, spotify_link_url, cover_image_url, updated_at')
    .is('deleted_at', null)
    .not('spotify_link_url', 'is', null)
    .order('updated_at', { ascending: false })
    .limit(50);

  // Get total counts
  const { count: totalSongs } = await supabase
    .from('songs')
    .select('*', { count: 'exact', head: true })
    .is('deleted_at', null);

  const { count: withSpotify } = await supabase
    .from('songs')
    .select('*', { count: 'exact', head: true })
    .is('deleted_at', null)
    .not('spotify_link_url', 'is', null);

  const stats = {
    total: totalSongs || 0,
    withSpotify: withSpotify || 0,
    withoutSpotify: (totalSongs || 0) - (withSpotify || 0),
    coveragePercentage: totalSongs ? Math.round((withSpotify || 0) / totalSongs * 100) : 0,
  };

  return (
    <SpotifyMatchesClient
      initialSongsWithoutSpotify={songsWithoutSpotify || []}
      initialRecentlySynced={recentlySynced || []}
      stats={stats}
    />
  );
}
