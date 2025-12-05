import { redirect } from 'next/navigation';
import { createClient } from '@/lib/supabase/server';
import Link from 'next/link';
import StatusBadge, { getStatusVariant, formatStatus } from '@/components/shared/StatusBadge';

/**
 * Format date for display
 */
function formatDate(dateString: string | null): string {
  if (!dateString) return 'Not set';

  const date = new Date(dateString);
  return date.toLocaleDateString('en-US', {
    year: 'numeric',
    month: 'long',
    day: 'numeric',
  });
}

/**
 * Assignment header component
 */
function AssignmentHeader({ title, status }: { title: string; status: string }) {
  return (
    <div
      className="mb-4 sm:mb-6 flex flex-col sm:flex-row sm:items-start 
                    sm:justify-between gap-3"
    >
      <div>
        <h1
          className="text-xl sm:text-2xl md:text-3xl font-bold 
                       text-gray-900 dark:text-white mb-2"
        >
          {title}
        </h1>
        <StatusBadge variant={getStatusVariant(status)}>{formatStatus(status)}</StatusBadge>
      </div>
    </div>
  );
}

/**
 * Student and teacher info fields
 */
function UserFields({ assignment }: { assignment: any }) {
  // eslint-disable-line @typescript-eslint/no-explicit-any
  return (
    <>
      <div>
        <h3
          className="text-xs sm:text-sm font-semibold text-gray-900 
                       dark:text-white mb-1"
        >
          Student
        </h3>
        <p className="text-xs sm:text-sm text-gray-700 dark:text-gray-300">
          {assignment.student_profile?.full_name || assignment.student_profile?.email || 'Unknown'}
        </p>
      </div>

      <div>
        <h3
          className="text-xs sm:text-sm font-semibold text-gray-900 
                       dark:text-white mb-1"
        >
          Teacher
        </h3>
        <p className="text-xs sm:text-sm text-gray-700 dark:text-gray-300">
          {assignment.teacher_profile?.full_name || assignment.teacher_profile?.email || 'Unknown'}
        </p>
      </div>

      <div>
        <h3
          className="text-xs sm:text-sm font-semibold text-gray-900 
                       dark:text-white mb-1"
        >
          Due Date
        </h3>
        <p className="text-xs sm:text-sm text-gray-700 dark:text-gray-300">
          {formatDate(assignment.due_date)}
        </p>
      </div>

      {assignment.lesson && (
        <div>
          <h3
            className="text-xs sm:text-sm font-semibold text-gray-900 
                         dark:text-white mb-1"
          >
            Related Lesson
          </h3>
          <Link
            href={`/dashboard/lessons/${assignment.lesson.id}`}
            className="text-xs sm:text-sm text-blue-600 dark:text-blue-400 
                       hover:underline"
          >
            Lesson #{assignment.lesson.lesson_teacher_number}
          </Link>
        </div>
      )}
    </>
  );
}

/**
 * Assignment info section
 */
function AssignmentInfo({ assignment }: { assignment: any }) {
  // eslint-disable-line @typescript-eslint/no-explicit-any
  return (
    <div className="space-y-4 sm:space-y-6">
      <div>
        <h2
          className="text-sm sm:text-base font-semibold text-gray-900 
                       dark:text-white mb-2"
        >
          Description
        </h2>
        <p className="text-xs sm:text-sm text-gray-700 dark:text-gray-300">
          {assignment.description || 'No description provided'}
        </p>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        <UserFields assignment={assignment} />
      </div>
    </div>
  );
}

/**
 * Assignment detail page
 * Shows full assignment information
 */
export default async function AssignmentDetailPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const supabase = await createClient();

  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    redirect('/login');
  }

  // Fetch assignment
  const { data: assignment, error } = await supabase
    .from('assignments')
    .select(
      `
      *,
      teacher_profile:profiles!assignments_teacher_id_fkey(id, email, full_name),
      student_profile:profiles!assignments_student_id_fkey(id, email, full_name),
      lesson:lessons(id, lesson_teacher_number, scheduled_at, status)
    `
    )
    .eq('id', id)
    .single();

  if (error || !assignment) {
    return (
      <div className="container mx-auto px-3 sm:px-4 md:px-6 py-4 sm:py-6 md:py-8">
        <div
          className="p-4 bg-red-50 dark:bg-red-900/20 border border-red-200 
                        dark:border-red-800 rounded-lg"
        >
          <p className="text-xs sm:text-sm text-red-800 dark:text-red-200">Assignment not found</p>
        </div>
      </div>
    );
  }

  return (
    <div className="container mx-auto px-3 sm:px-4 md:px-6 py-4 sm:py-6 md:py-8">
      <div className="mb-4 sm:mb-6">
        <Link
          href="/dashboard/assignments"
          className="text-xs sm:text-sm text-blue-600 dark:text-blue-400 
                     hover:underline"
        >
          ← Back to Assignments
        </Link>
      </div>

      <div
        className="bg-white dark:bg-gray-800 rounded-lg shadow-sm border 
                      border-gray-200 dark:border-gray-700 p-4 sm:p-6"
      >
        <AssignmentHeader title={assignment.title} status={assignment.status} />
        <AssignmentInfo assignment={assignment} />
      </div>
    </div>
  );
}
