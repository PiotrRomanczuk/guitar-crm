import { SongDetail } from '@/components/songs';
import SongLessons from '@/components/songs/SongLessons';
import { getUserWithRolesSSR } from '@/lib/getUserWithRolesSSR';
import { Breadcrumbs } from '@/components/shared';
import { redirect } from 'next/navigation';
import { getSongStudents } from './actions';
import { SongStudents } from '@/components/songs/SongStudents';

interface SongPageProps {
  params: Promise<{
    id: string;
  }>;
}

export default async function SongPage({ params }: SongPageProps) {
  const { user, isAdmin, isTeacher } = await getUserWithRolesSSR();
  if (!user) {
    redirect('/sign-in');
  }

  const { id } = await params;

  // Fetch students if user is teacher or admin
  const canViewStudents = isAdmin || isTeacher;
  const students = canViewStudents ? await getSongStudents(id) : [];

  return (
    <div className="container mx-auto px-4 py-8 space-y-8">
      <Breadcrumbs
        items={[
          { label: 'Dashboard', href: '/dashboard' },
          { label: 'Songs', href: '/dashboard/songs' },
          { label: 'Song Details' },
        ]}
      />

      <SongDetail songId={id} isAdmin={isAdmin} isTeacher={isTeacher} />

      <SongLessons songId={id} />

      {canViewStudents && (
        <div>
          <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-4">Active Students</h2>
          <SongStudents students={students} />
        </div>
      )}
    </div>
  );
}
