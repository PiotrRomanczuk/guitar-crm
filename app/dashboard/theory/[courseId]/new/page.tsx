import { redirect } from 'next/navigation';
import Link from 'next/link';
import { getUserWithRolesSSR } from '@/lib/getUserWithRolesSSR';
import { getTheoryCourse } from '../../actions';
import { TheoryLessonForm } from '@/components/theory';

interface Props {
  params: Promise<{ courseId: string }>;
}

export default async function NewTheoryLessonPage({ params }: Props) {
  const { courseId } = await params;
  const { user, isAdmin, isTeacher } = await getUserWithRolesSSR();
  if (!user) redirect('/sign-in');
  if (!isAdmin && !isTeacher) redirect('/dashboard/theory');

  const course = await getTheoryCourse(courseId);
  if (!course) redirect('/dashboard/theory');

  return (
    <div className="container mx-auto px-3 sm:px-4 md:px-6 lg:px-8 py-4 sm:py-6 lg:py-8 max-w-7xl">
      <nav className="mb-6 text-sm text-muted-foreground">
        <Link href="/dashboard/theory" className="hover:underline">
          Theory
        </Link>
        <span className="mx-2">/</span>
        <Link href={`/dashboard/theory/${courseId}`} className="hover:underline">
          {course.title}
        </Link>
        <span className="mx-2">/</span>
        <span>New Chapter</span>
      </nav>

      <h1 className="text-2xl font-bold mb-6">Add Chapter</h1>
      <TheoryLessonForm courseId={courseId} mode="create" />
    </div>
  );
}
