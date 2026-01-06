import LessonList from '@/components/lessons/list';
import { getUserWithRolesSSR } from '@/lib/getUserWithRolesSSR';
import { redirect } from 'next/navigation';
import { StudentLessonsPageClient } from '@/components/lessons/student/StudentLessonsPageClient';

type Props = {
  searchParams: Promise<{ [key: string]: string | string[] | undefined }>;
};

export default async function LessonsPage(props: Props) {
  const searchParams = await props.searchParams;
  const { user, isAdmin, isTeacher, isStudent } = await getUserWithRolesSSR();
  
  if (!user) redirect('/sign-in');

  // If user is a student and NOT an admin/teacher, show the student view
  if (isStudent && !isAdmin && !isTeacher) {
    return <StudentLessonsPageClient />;
  }

  return (
    <div className="container mx-auto px-4 py-8">
      <LessonList searchParams={searchParams} />
    </div>
  );
}

