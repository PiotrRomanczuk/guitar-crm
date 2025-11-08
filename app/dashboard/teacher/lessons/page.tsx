import { RequireTeacher } from '@/components/auth';
import Link from 'next/link';
import { getUserWithRolesSSR } from '@/lib/getUserWithRolesSSR';
import { createClient } from '@/lib/supabase/server';
import { getLessonsHandler } from '@/app/api/lessons/handlers';

interface Lesson {
  id: string;
  date: string;
  start_time: string;
  title?: string;
  status: string;
  student_profile?: { full_name: string | null };
}

interface LessonPageData {
  lessons: Lesson[];
  error: string | null;
}

function LessonRow({ lesson }: { lesson: Lesson }) {
  return (
    <tr className="hover:bg-gray-50 dark:hover:bg-gray-700" data-testid="lesson-row">
      <td className="px-4 py-3 text-sm text-gray-900 dark:text-white" data-testid="lesson-date">
        {new Date(lesson.date).toLocaleDateString()}
      </td>
      <td className="px-4 py-3 text-sm text-gray-900 dark:text-white" data-testid="lesson-time">
        {lesson.start_time}
      </td>
      <td className="px-4 py-3 text-sm text-gray-900 dark:text-white" data-testid="lesson-title">
        {lesson.title || '-'}
      </td>
      <td className="px-4 py-3 text-sm text-gray-900 dark:text-white" data-testid="lesson-student">
        {lesson.student_profile?.full_name || 'Unknown'}
      </td>
      <td className="px-4 py-3 text-sm">
        <span
          data-testid="lesson-status"
          className={`px-2 py-1 rounded-full text-xs font-medium ${
            lesson.status === 'COMPLETED'
              ? 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200'
              : lesson.status === 'CANCELLED'
              ? 'bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-200'
              : 'bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-200'
          }`}
        >
          {lesson.status}
        </span>
      </td>
      <td className="px-4 py-3 text-sm">
        <Link
          href={`/teacher/lessons/${lesson.id}`}
          className="text-blue-600 hover:text-blue-800 dark:text-blue-400"
          data-testid="lesson-view-link"
        >
          View
        </Link>
      </td>
    </tr>
  );
}

function LessonTable({ lessons }: { lessons: Lesson[] }) {
  return (
    <div className="overflow-x-auto">
      <table className="w-full">
        <thead className="bg-gray-50 dark:bg-gray-700">
          <tr>
            <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase">
              Date
            </th>
            <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase">
              Time
            </th>
            <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase">
              Title
            </th>
            <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase">
              Student
            </th>
            <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase">
              Status
            </th>
            <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase">
              Actions
            </th>
          </tr>
        </thead>
        <tbody className="divide-y divide-gray-200 dark:divide-gray-700">
          {lessons.map((lesson) => (
            <LessonRow key={lesson.id} lesson={lesson} />
          ))}
        </tbody>
      </table>
    </div>
  );
}

async function fetchTeacherLessons(): Promise<LessonPageData> {
  try {
    const supabase = await createClient();
    const { user, isTeacher } = await getUserWithRolesSSR();

    if (!isTeacher) {
      return { lessons: [], error: 'Forbidden: Must be a teacher' };
    }

    const profile = {
      isAdmin: false,
      isTeacher: true,
      isStudent: false,
    };

    // Use the same handler as the API route
    const result = await getLessonsHandler(supabase, user, profile, {});

    if (result.error) {
      return { lessons: [], error: result.error };
    }

    return { lessons: (result.lessons as Lesson[]) || [], error: null };
  } catch (err) {
    return {
      lessons: [],
      error: err instanceof Error ? err.message : 'Failed to load lessons',
    };
  }
}

export default async function TeacherLessonsPage() {
  const { isTeacher } = await getUserWithRolesSSR();

  if (!isTeacher) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <h1 className="text-2xl font-bold text-red-600 mb-2">Access Denied</h1>
          <p className="text-gray-600">You must be a teacher to access this page.</p>
        </div>
      </div>
    );
  }

  const { lessons, error } = await fetchTeacherLessons();

  return (
    <RequireTeacher>
      <div className="min-h-screen bg-linear-to-br from-blue-50 to-indigo-100 dark:from-gray-900 dark:to-gray-800">
        <main className="container mx-auto px-3 sm:px-4 py-4 sm:py-8 max-w-7xl">
          <header className="mb-6 sm:mb-8 flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
            <div>
              <h1 className="text-2xl sm:text-3xl font-bold text-gray-900 dark:text-white mb-2">
                📚 My Lessons
              </h1>
              <p className="text-sm sm:text-base text-gray-600 dark:text-gray-300">
                Manage lessons with your students
              </p>
            </div>
            <Link
              href="/teacher/lessons/new"
              className="px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg font-medium transition-colors"
              data-testid="new-lesson-button"
            >
              + New Lesson
            </Link>
          </header>

          <div className="bg-white dark:bg-gray-800 rounded-lg shadow-md">
            {error && (
              <div
                className="p-8 text-center text-red-600 dark:text-red-400"
                data-testid="error-state"
              >
                Error: {error}
              </div>
            )}

            {!error && lessons.length === 0 && (
              <div
                className="p-8 text-center text-gray-600 dark:text-gray-300"
                data-testid="empty-state"
              >
                No lessons found. Create your first lesson!
              </div>
            )}

            {!error && lessons.length > 0 && (
              <div data-testid="lessons-table">
                <LessonTable lessons={lessons} />
              </div>
            )}
          </div>
        </main>
      </div>
    </RequireTeacher>
  );
}
