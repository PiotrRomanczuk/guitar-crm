import SongFormGuard from '@/components/songs/SongFormGuard';
import { getUserWithRolesSSR } from '@/lib/getUserWithRolesSSR';
import { redirect } from 'next/navigation';

interface EditSongPageProps {
  params: Promise<{
    id: string;
  }>;
}

export default async function EditSongPage({ params }: EditSongPageProps) {
  const { user, isAdmin } = await getUserWithRolesSSR();
  if (!user) redirect('/sign-in');
  if (!isAdmin) {
    return (
      <div className="container mx-auto px-4 py-8">
        <div
          className="max-w-xl mx-auto p-6 bg-red-50 border border-red-200 rounded text-red-700"
          data-testid="song-form-forbidden"
        >
          You do not have permission to edit songs.
        </div>
      </div>
    );
  }
  const { id } = await params;

  return (
    <div className="container mx-auto px-4 py-8">
      <SongFormGuard mode="edit" songId={id} />
    </div>
  );
}
