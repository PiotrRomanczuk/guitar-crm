import Link from 'next/link';
import { redirect } from 'next/navigation';
import { getUserWithRolesSSR } from '@/lib/getUserWithRolesSSR';
import { createClient } from '@/lib/supabase/server';

interface LessonEditPageProps {
  params: Promise<{ id: string }>;
}

async function fetchLesson(id: string) {
  try {
    const supabase = await createClient();
    const { user } = await getUserWithRolesSSR();

    if (!user) {
      return null;
    }

    const { data } = await supabase.from('lessons').select('*').eq('id', id).single();
    return data;
  } catch {
    return null;
  }
}

async function verifyEditAccess(
  lessonId: string,
  userId: string,
  isAdmin: boolean,
  isTeacher: boolean
) {
  if (!isTeacher && !isAdmin) {
    return false;
  }

  const supabase = await createClient();
  const { data: lesson } = await supabase
    .from('lessons')
    .select('teacher_id')
    .eq('id', lessonId)
    .single();

  return isAdmin || lesson?.teacher_id === userId;
}

async function handleUpdateLesson(formData: FormData) {
  'use server';
  const supabase = await createClient();
  const { user, isAdmin, isTeacher } = await getUserWithRolesSSR();

  if (!user) {
    redirect('/sign-in');
  }

  const lessonId = formData.get('lessonId') as string;
  const hasAccess = await verifyEditAccess(lessonId, user.id, isAdmin, isTeacher);

  if (!hasAccess) {
    throw new Error('Unauthorized');
  }

  const title = formData.get('title') as string;
  const date = formData.get('date') as string;
  const startTime = formData.get('startTime') as string;
  const notes = formData.get('notes') as string;
  const status = formData.get('status') as string;

  try {
    await supabase
      .from('lessons')
      .update({
        title,
        date,
        start_time: startTime,
        notes: notes || null,
        status: status || 'SCHEDULED',
      })
      .eq('id', lessonId);

    redirect(`/dashboard/lessons/${lessonId}`);
  } catch {
    throw new Error('Failed to update lesson');
  }
}

export default async function LessonEditPage({ params }: LessonEditPageProps) {
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

  const canEdit = await verifyEditAccess(id, user.id, isAdmin, isTeacher);

  if (!canEdit) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <h1 className="text-2xl font-bold text-red-600 mb-2">Access Denied</h1>
          <p className="text-gray-600 mb-4">You do not have permission to edit this lesson.</p>
          <Link href="/dashboard/lessons" className="text-blue-600 hover:underline">
            Back to Lessons
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="mb-6">
        <Link href={`/dashboard/lessons/${id}`} className="text-blue-600 hover:underline">
          Back to Lesson
        </Link>
      </div>

      <div className="bg-white dark:bg-gray-800 rounded-lg shadow-md p-6 mb-6">
        <h1 className="text-3xl font-bold text-gray-900 dark:text-white mb-6">Edit Lesson</h1>

        <form action={handleUpdateLesson} className="space-y-6" data-testid="lesson-edit-form">
          <input type="hidden" name="lessonId" value={lesson.id} />

          <div>
            <label
              htmlFor="title"
              className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2"
            >
              Title
            </label>
            <input
              type="text"
              id="title"
              name="title"
              defaultValue={lesson.title || ''}
              className="w-full px-4 py-2 border border-gray-300 bg-white dark:bg-gray-700 dark:border-gray-600 rounded-lg shadow-sm"
              required
              data-testid="lesson-edit-title"
            />
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label
                htmlFor="date"
                className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2"
              >
                Date
              </label>
              <input
                type="date"
                id="date"
                name="date"
                defaultValue={lesson.date || ''}
                className="w-full px-4 py-2 border border-gray-300 bg-white dark:bg-gray-700 dark:border-gray-600 rounded-lg shadow-sm"
                required
                data-testid="lesson-edit-date"
              />
            </div>

            <div>
              <label
                htmlFor="startTime"
                className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2"
              >
                Start Time
              </label>
              <input
                type="time"
                id="startTime"
                name="startTime"
                defaultValue={lesson.start_time || ''}
                className="w-full px-4 py-2 border border-gray-300 bg-white dark:bg-gray-700 dark:border-gray-600 rounded-lg shadow-sm"
                required
                data-testid="lesson-edit-start-time"
              />
            </div>
          </div>

          <div>
            <label
              htmlFor="status"
              className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2"
            >
              Status
            </label>
            <select
              id="status"
              name="status"
              defaultValue={lesson.status || 'SCHEDULED'}
              className="w-full px-4 py-2 border border-gray-300 bg-white dark:bg-gray-700 dark:border-gray-600 rounded-lg shadow-sm"
              data-testid="lesson-edit-status"
            >
              <option value="SCHEDULED">Scheduled</option>
              <option value="COMPLETED">Completed</option>
              <option value="CANCELLED">Cancelled</option>
            </select>
          </div>

          <div>
            <label
              htmlFor="notes"
              className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2"
            >
              Notes
            </label>
            <textarea
              id="notes"
              name="notes"
              defaultValue={lesson.notes || ''}
              className="w-full px-4 py-2 border border-gray-300 bg-white dark:bg-gray-700 dark:border-gray-600 rounded-lg shadow-sm"
              rows={5}
              data-testid="lesson-edit-notes"
            />
          </div>

          <div className="flex gap-3">
            <button
              type="submit"
              className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
              data-testid="lesson-edit-submit"
            >
              Save Changes
            </button>

            <Link
              href={`/dashboard/lessons/${id}`}
              className="px-4 py-2 bg-gray-600 text-white rounded-lg hover:bg-gray-700"
              data-testid="lesson-edit-cancel"
            >
              Cancel
            </Link>
          </div>
        </form>
      </div>
    </div>
  );
}
