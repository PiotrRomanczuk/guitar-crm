import { redirect } from 'next/navigation';
import Link from 'next/link';
import { getUserWithRolesSSR } from '@/lib/getUserWithRolesSSR';
import { getTheoryCourse, getTheoryLesson } from '../../../actions';
import { TheoryLessonForm } from '@/components/theory';

interface Props {
  params: Promise<{ courseId: string; lessonId: string }>;
}

export default async function EditTheoryLessonPage({ params }: Props) {
  const { courseId, lessonId } = await params;
  const { user, isAdmin, isTeacher } = await getUserWithRolesSSR();
  if (!user) redirect('/sign-in');
  if (!isAdmin && !isTeacher) redirect('/dashboard/theory');

  const [course, lesson] = await Promise.all([
    getTheoryCourse(courseId),
    getTheoryLesson(lessonId),
  ]);

  if (!course || !lesson) redirect(`/dashboard/theory/${courseId}`);

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
        <Link href={`/dashboard/theory/${courseId}/${lessonId}`} className="hover:underline">
          {lesson.title}
        </Link>
        <span className="mx-2">/</span>
        <span>Edit</span>
      </nav>

      <h1 className="text-2xl font-bold mb-6">Edit Chapter</h1>
      <TheoryLessonForm
        courseId={courseId}
        mode="edit"
        lessonId={lessonId}
        defaultValues={{
          title: lesson.title,
          content: lesson.content,
          excerpt: lesson.excerpt ?? '',
          is_published: lesson.is_published,
        }}
      />
    </div>
  );
}
