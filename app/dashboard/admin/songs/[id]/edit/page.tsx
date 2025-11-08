import { getUserWithRolesSSR } from '@/lib/getUserWithRolesSSR';
import { redirect } from 'next/navigation';
import { createClient } from '@/lib/supabase/server';
import SongForm from '@/components/songs/SongForm';

/**
 * Admin Edit Song Page
 * Allows admins to edit existing songs
 */
export default async function AdminEditSongPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { user, isAdmin } = await getUserWithRolesSSR();

  if (!user) {
    redirect('/sign-in');
  }

  // Admin-only access
  if (!isAdmin) {
    redirect('/dashboard');
  }

  const { id } = await params;
  const supabase = await createClient();

  const { data: song, error } = await supabase
    .from('songs')
    .select('*')
    .eq('id', id)
    .single();

  if (error || !song) {
    return (
      <div className="container mx-auto px-4 py-8">
        <div data-testid="song-not-found" className="text-red-500">
          Song not found
        </div>
      </div>
    );
  }

  return (
    <div className="container mx-auto px-4 py-8">
      <div data-testid="admin-song-edit-page">
        <h1 className="text-2xl font-bold mb-6">Edit Song</h1>
        <SongForm mode="edit" song={song} />
      </div>
    </div>
  );
}
