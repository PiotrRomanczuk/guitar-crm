import { createClient } from '@/lib/supabase/server';
import { getUserWithRolesSSR } from '@/lib/getUserWithRolesSSR';
import { SongListClient } from './Client';

export default async function SongList() {
  const { user, isAdmin } = await getUserWithRolesSSR();

  if (!user) {
    return <div data-testid="song-list-error">Not authenticated</div>;
  }

  const supabase = await createClient();

  // Fetch songs server-side with proper authentication
  const { data: songs, error } = await supabase
    .from('songs')
    .select('*')
    .order('created_at', { ascending: false });

  if (error) {
    console.error('Error fetching songs:', error);
    return <div data-testid="song-list-error">Error loading songs: {error.message}</div>;
  }

  return (
    <SongListClient initialSongs={songs || []} isAdmin={!!isAdmin} />
  );
}
