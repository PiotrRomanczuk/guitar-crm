import { SongForm } from '@/components/songs';
import { getUserWithRolesSSR } from '@/lib/getUserWithRolesSSR';
import { redirect, notFound } from 'next/navigation';
import { createClient } from '@/lib/supabase/server';
import { Song } from '@/schemas/SongSchema';

interface EditSongPageProps {
  params: Promise<{
    id: string;
  }>;
}

export default async function EditSongPage({ params }: EditSongPageProps) {
  const { user, isAdmin, isTeacher } = await getUserWithRolesSSR();
  if (!user) redirect('/sign-in');
  if (!isAdmin && !isTeacher) {
    return (
      <div className="container mx-auto px-4 py-8">
        <div
          className="max-w-xl mx-auto p-6 bg-destructive/10 border border-destructive/20 rounded text-destructive"
          data-testid="song-form-forbidden"
        >
          You do not have permission to edit songs.
        </div>
      </div>
    );
  }
  const { id } = await params;

  const supabase = await createClient();
  const { data: song, error } = await supabase.from('songs').select('*').eq('id', id).single();

  if (error || !song) {
    notFound();
  }

  return (
    <div className="container mx-auto px-4 py-8">
      <SongForm mode="edit" song={song as unknown as Song} />
    </div>
  );
}
