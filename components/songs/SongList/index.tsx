import { createClient } from '@/lib/supabase/server';
import { getUserWithRolesSSR } from '@/lib/getUserWithRolesSSR';
import SongListHeader from './Header';
import SongListTable from './Table';
import SongListEmpty from './Empty';

export default async function SongList() {
  const { user } = await getUserWithRolesSSR();

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
    <div>
      <SongListHeader />
      {!songs || songs.length === 0 ? <SongListEmpty /> : <SongListTable songs={songs} />}
    </div>
  );
}
