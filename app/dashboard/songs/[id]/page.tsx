import { SongDetail, SongLessons, SongAssignments, SongStudents } from '@/components/songs';
import { getUserWithRolesSSR } from '@/lib/getUserWithRolesSSR';
import { Breadcrumbs } from '@/components/shared';
import { redirect } from 'next/navigation';
import { getSongStudents } from './actions';
import { StudentSongDetailPageClient } from '@/components/songs/student/StudentSongDetailPageClient';
import { SongStatusHistory } from '@/components/shared/SongStatusHistory';

interface SearchParams {
  [key: string]: string | string[] | undefined;
}

interface SongPageProps {
  params: Promise<{
    id: string;
  }>;
  searchParams: Promise<SearchParams>;
}

export default async function SongPage({ params, searchParams }: SongPageProps) {
  const { user, isAdmin, isTeacher, isStudent } = await getUserWithRolesSSR();
  if (!user) {
    redirect('/sign-in');
  }

  // If user is a student and NOT an admin/teacher, show the student view
  if (isStudent && !isAdmin && !isTeacher) {
    return <StudentSongDetailPageClient />;
  }

  const { id } = await params;
  // Ensure searchParams are awaited to satisfy the interface, even if unused
  await searchParams;

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

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        <div className="lg:col-span-2 space-y-8">
          <SongDetail songId={id} isAdmin={isAdmin} isTeacher={isTeacher} />

          <SongLessons songId={id} />

          <SongAssignments songId={id} />

          {canViewStudents && (
            <div>
              <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-4">
                Active Students
              </h2>
              <SongStudents students={students} />
            </div>
          )}
        </div>

        <div className="lg:col-span-1">
          <SongStatusHistory songId={id} title="Learning Progress" />
        </div>
      </div>
    </div>
  );
}
