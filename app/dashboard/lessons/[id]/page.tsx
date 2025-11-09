import Link from 'next/link';
import { redirect } from 'next/navigation';
import { getUserWithRolesSSR } from '@/lib/getUserWithRolesSSR';
import { createClient } from '@/lib/supabase/server';
import { LessonWithProfiles } from '@/schemas/LessonSchema';

interface LessonDetailPageProps {
  params: Promise<{ id: string }>;
}

async function fetchLesson(id: string): Promise<LessonWithProfiles | null> {
  try {
    const supabase = await createClient();
    const { user } = await getUserWithRolesSSR();

    if (!user) {
      return null;
    }

    const { data, error } = await supabase
      .from('lessons')
      .select(
        `
        *,
        profile:student_id(id, full_name, email),
        teacher_profile:teacher_id(id, full_name, email)
      `
      )
      .eq('id', id)
      .single();

    if (error || !data) {
      return null;
    }

    return data as LessonWithProfiles;
  } catch {
    return null;
  }
}

function formatDate(dateStr: string | null | undefined): string {
  if (!dateStr) return 'N/A';
  try {
    return new Date(dateStr).toLocaleDateString();
  } catch {
    return 'Invalid Date';
  }
}

function formatTime(timeStr: string | null | undefined): string {
  if (!timeStr) return 'N/A';
  try {
    const date = new Date(`2000-01-01T${timeStr}`);
    return date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
  } catch {
    return 'Invalid Time';
  }
}

async function handleDeleteLesson(id: string) {
  'use server';
  const supabase = await createClient();
  await supabase.from('lessons').delete().eq('id', id);
  redirect('/dashboard/lessons');
}

export default async function LessonDetailPage({ params }: LessonDetailPageProps) {
  const { id } = await params;
  const { user, isAdmin, isTeacher } = await getUserWithRolesSSR();

  if (!user) {
    redirect('/sign-in');
  }

  const lesson = await fetchLesson(id);

  if (!lesson) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <h1 className="text-2xl font-bold text-red-600 mb-2">Lesson Not Found</h1>
          <p className="text-gray-600 mb-4">The lesson does not exist.</p>
          <Link href="/dashboard/lessons" className="text-blue-600 hover:underline">
            Back to Lessons
          </Link>
        </div>
      </div>
    );
  }

  const canEdit = isAdmin || (isTeacher && lesson.teacher_id === user.id);
  const canDelete = isAdmin || (isTeacher && lesson.teacher_id === user.id);

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="mb-6">
        <Link href="/dashboard/lessons" className="text-blue-600 hover:underline">
          Back to Lessons
        </Link>
      </div>

      <div
        className="bg-white dark:bg-gray-800 rounded-lg shadow-md p-6 mb-6"
        data-testid="lesson-detail"
      >
        <div className="flex items-start justify-between mb-4">
          <div>
            <h1 className="text-3xl font-bold text-gray-900 dark:text-white mb-2">
              {lesson.title || 'Untitled'}
            </h1>
            <p className="text-gray-600 dark:text-gray-400">
              ID:{' '}
              <code className="bg-gray-100 dark:bg-gray-700 px-2 py-1 rounded">{lesson.id}</code>
            </p>
          </div>

          <div>
            <span
              className={`inline-block px-4 py-2 rounded-full text-sm font-medium ${
                lesson.status === 'COMPLETED'
                  ? 'bg-green-100 dark:bg-green-900/30 text-green-800'
                  : 'bg-blue-100 dark:bg-blue-900/30 text-blue-800'
              }`}
            >
              {lesson.status || 'SCHEDULED'}
            </span>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mt-6">
          <div>
            <h2 className="text-sm font-semibold text-gray-700 uppercase mb-2">Student</h2>
            <p className="text-lg text-gray-900 dark:text-white">
              {lesson.profile?.full_name || lesson.profile?.email || 'Unknown'}
            </p>
          </div>

          <div>
            <h2 className="text-sm font-semibold text-gray-700 uppercase mb-2">Teacher</h2>
            <p className="text-lg text-gray-900 dark:text-white">
              {lesson.teacher_profile?.full_name || lesson.teacher_profile?.email || 'Unknown'}
            </p>
          </div>

          <div>
            <h2 className="text-sm font-semibold text-gray-700 uppercase mb-2">Date</h2>
            <p className="text-lg text-gray-900 dark:text-white">{formatDate(lesson.date)}</p>
          </div>

          <div>
            <h2 className="text-sm font-semibold text-gray-700 uppercase mb-2">Time</h2>
            <p className="text-lg text-gray-900 dark:text-white">{formatTime(lesson.start_time)}</p>
          </div>

          <div>
            <h2 className="text-sm font-semibold text-gray-700 uppercase mb-2">Lesson #</h2>
            <p className="text-lg text-gray-900 dark:text-white">
              {lesson.lesson_teacher_number || 'N/A'}
            </p>
          </div>
        </div>

        {lesson.notes && (
          <div className="mt-6">
            <h2 className="text-sm font-semibold text-gray-700 uppercase mb-2">Notes</h2>
            <p className="text-gray-900 dark:text-white whitespace-pre-wrap">{lesson.notes}</p>
          </div>
        )}

        <div className="flex gap-3 mt-8">
          {canEdit && (
            <Link
              href={`/dashboard/lessons/${lesson.id}/edit`}
              className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
              data-testid="lesson-edit-button"
            >
              Edit
            </Link>
          )}

          {canDelete && (
            <form action={async () => handleDeleteLesson(id)} className="inline">
              <button
                type="submit"
                className="px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700"
                data-testid="lesson-delete-button"
              >
                Delete
              </button>
            </form>
          )}

          <Link
            href="/dashboard/lessons"
            className="px-4 py-2 bg-gray-600 text-white rounded-lg hover:bg-gray-700"
          >
            Back
          </Link>
        </div>
      </div>

      <div className="bg-white dark:bg-gray-800 rounded-lg shadow-md p-6 mb-6">
        <h2 className="text-xl font-bold mb-4">Lesson Songs</h2>
        <p className="text-gray-600">Coming soon</p>
      </div>

      <div className="bg-white dark:bg-gray-800 rounded-lg shadow-md p-6">
        <h2 className="text-xl font-bold mb-4">Tasks</h2>
        <p className="text-gray-600">Coming soon</p>
      </div>
    </div>
  );
}
