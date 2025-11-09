import { SongList } from '@/components/songs';
import { getUserWithRolesSSR } from '@/lib/getUserWithRolesSSR';
import { redirect } from 'next/navigation';

export default async function SongsPage() {
  const { user, isAdmin, isTeacher } = await getUserWithRolesSSR();
  if (!user) redirect('/sign-in');

  return (
    <div className="container mx-auto px-4 py-8">
      {/* Pass SSR-resolved role flags to avoid client auth context */}
      <SongList isAdmin={isAdmin} isTeacher={isTeacher} />
    </div>
  );
}
