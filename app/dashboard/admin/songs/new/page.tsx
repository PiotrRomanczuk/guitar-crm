import { getUserWithRolesSSR } from '@/lib/getUserWithRolesSSR';
import { redirect } from 'next/navigation';
import SongForm from '@/components/songs/SongForm';

/**
 * Admin Create Song Page
 * Allows admins to create new songs
 */
export default async function AdminNewSongPage() {
  const { user, isAdmin } = await getUserWithRolesSSR();

  if (!user) {
    redirect('/sign-in');
  }

  // Admin-only access
  if (!isAdmin) {
    redirect('/dashboard');
  }

  return (
    <div className="container mx-auto px-4 py-8">
      <div data-testid="admin-song-create-page">
        <h1 className="text-2xl font-bold mb-6">Create New Song</h1>
        <SongForm mode="create" />
      </div>
    </div>
  );
}
