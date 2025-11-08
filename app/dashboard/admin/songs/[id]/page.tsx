import { getUserWithRolesSSR } from '@/lib/getUserWithRolesSSR';
import { redirect } from 'next/navigation';
import SongDetail from '@/components/songs/SongDetail';

/**
 * Admin Song Detail Page
 * Displays detailed view of a specific song for admins
 */
export default async function AdminSongDetailPage({
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

  return (
    <div className="container mx-auto px-4 py-8">
      <div data-testid="admin-song-detail-page">
        <SongDetail songId={id} />
      </div>
    </div>
  );
}
