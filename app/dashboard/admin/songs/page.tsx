import { SongList } from '@/components/songs';
import { getUserWithRolesSSR } from '@/lib/getUserWithRolesSSR';
import { redirect } from 'next/navigation';

/**
 * Admin Songs List Page
 * Displays all songs in the system with admin-level access
 */
export default async function AdminSongsPage() {
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
      <div data-testid="admin-songs-page">
        <SongList />
      </div>
    </div>
  );
}
