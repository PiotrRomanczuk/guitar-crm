import { SongList } from '@/components/songs';
import { getUserWithRolesSSR } from '@/lib/getUserWithRolesSSR';
import { redirect } from 'next/navigation';
import { StudentSongsPageClient } from '@/components/songs/student/StudentSongsPageClient';

type Props = {
  searchParams: Promise<{ [key: string]: string | string[] | undefined }>;
};

export default async function SongsPage(props: Props) {
  const searchParams = await props.searchParams;
  const { user, isAdmin, isTeacher, isStudent } = await getUserWithRolesSSR();
  if (!user) redirect('/sign-in');

  // If user is a student and NOT an admin/teacher, show the student view
  if (isStudent && !isAdmin && !isTeacher) {
    return <StudentSongsPageClient />;
  }

  return (
    <div className="container mx-auto px-3 sm:px-4 md:px-6 lg:px-8 py-4 sm:py-6 lg:py-8 max-w-7xl">
      <SongList searchParams={searchParams} />
    </div>
  );
}
