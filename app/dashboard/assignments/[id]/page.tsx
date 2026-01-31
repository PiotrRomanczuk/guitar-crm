import { redirect } from 'next/navigation';
import { createClient } from '@/lib/supabase/server';
import Link from 'next/link';
import StatusBadge, { getStatusVariant, formatStatus } from '@/components/shared/StatusBadge';
import { Assignment } from '@/components/assignments/hooks/useAssignment';
import { HistoryTimeline } from '@/components/shared/HistoryTimeline';

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
                       text-foreground mb-2"
        >
          {title}
        </h1>
        <StatusBadge variant={getStatusVariant(status)}>{formatStatus(status)}</StatusBadge>
      </div>
    </div>
  );
}

interface ExtendedAssignment extends Assignment {
  lesson?: {
    id: string;
    lesson_teacher_number: number;
    scheduled_at: string;
    status: string;
    lesson_songs: {
      song: {
        id: string;
        title: string;
        author: string;
      } | null;
    }[];
  };
}

/**
 * Student and teacher info fields
 */
function UserFields({ assignment }: { assignment: ExtendedAssignment }) {
  return (
    <>
      <div>
        <h3
          className="text-xs sm:text-sm font-semibold text-foreground mb-1"
        >
          Student
        </h3>
        {assignment.student_profile ? (
          <Link
            href={`/dashboard/users/${assignment.student_profile.id}`}
            className="text-xs sm:text-sm text-primary hover:underline"
          >
            {assignment.student_profile.full_name || assignment.student_profile.email}
          </Link>
        ) : (
          <p className="text-xs sm:text-sm text-muted-foreground">Unknown</p>
        )}
      </div>

      <div>
        <h3
          className="text-xs sm:text-sm font-semibold text-foreground mb-1"
        >
          Teacher
        </h3>
        {assignment.teacher_profile ? (
          <Link
            href={`/dashboard/users/${assignment.teacher_profile.id}`}
            className="text-xs sm:text-sm text-primary hover:underline"
          >
            {assignment.teacher_profile.full_name || assignment.teacher_profile.email}
          </Link>
        ) : (
          <p className="text-xs sm:text-sm text-muted-foreground">Unknown</p>
        )}
      </div>

      <div>
        <h3
          className="text-xs sm:text-sm font-semibold text-foreground mb-1"
        >
          Due Date
        </h3>
        <p className="text-xs sm:text-sm text-muted-foreground">
          {formatDate(assignment.due_date)}
        </p>
      </div>

      {assignment.lesson && (
        <div>
          <h3
            className="text-xs sm:text-sm font-semibold text-foreground mb-1"
          >
            Related Lesson
          </h3>
          <Link
            href={`/dashboard/lessons/${assignment.lesson.id}`}
            className="text-xs sm:text-sm text-primary hover:underline"
          >
            Lesson #{assignment.lesson.lesson_teacher_number}
          </Link>
        </div>
      )}
    </>
  );
}

/**
 * Related Songs Section
 */
function RelatedSongs({ lesson }: { lesson: ExtendedAssignment['lesson'] }) {
  if (!lesson || !lesson.lesson_songs || lesson.lesson_songs.length === 0) {
    return null;
  }

  return (
    <div className="mt-6 pt-6 border-t border-border">
      <h3 className="text-sm sm:text-base font-semibold text-foreground mb-3">
        Related Songs
      </h3>
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
        {lesson.lesson_songs.map((ls, index) => {
          if (!ls.song) return null;
          return (
            <Link
              key={`${ls.song.id}-${index}`}
              href={`/dashboard/songs/${ls.song.id}`}
              className="block p-3 rounded-md border border-border
                         hover:bg-muted/50 transition-colors"
            >
              <div className="font-medium text-sm text-foreground">
                {ls.song.title}
              </div>
              <div className="text-xs text-muted-foreground">{ls.song.author}</div>
            </Link>
          );
        })}
      </div>
    </div>
  );
}

/**
 * Assignment info section
 */
function AssignmentInfo({ assignment }: { assignment: ExtendedAssignment }) {
  return (
    <div className="space-y-4 sm:space-y-6">
      <div>
        <h2
          className="text-sm sm:text-base font-semibold text-foreground mb-2"
        >
          Description
        </h2>
        <p className="text-xs sm:text-sm text-muted-foreground whitespace-pre-wrap">
          {assignment.description || 'No description provided'}
        </p>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        <UserFields assignment={assignment} />
      </div>

      <RelatedSongs lesson={assignment.lesson} />
    </div>
  );
}

interface PageProps {
  params: Promise<{ id: string }>;
  searchParams: Promise<{ [key: string]: string | string[] | undefined }>;
}

/**
 * Assignment detail page
 * Shows full assignment information
 */
export default async function AssignmentDetailPage({ params, searchParams }: PageProps) {
  const { id } = await params;
  // searchParams are available for future use (e.g. tabs, history)
  await searchParams;

  const supabase = await createClient();

  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    redirect('/login');
  }

  // Get user profile for role checking
  const { data: profile } = await supabase
    .from('profiles')
    .select('is_admin, is_teacher, is_student')
    .eq('id', user.id)
    .single();

  // Fetch assignment with extended relations
  const { data: assignment, error } = await supabase
    .from('assignments')
    .select(
      `
      *,
      teacher_profile:profiles!assignments_teacher_id_fkey(id, email, full_name),
      student_profile:profiles!assignments_student_id_fkey(id, email, full_name),
      lesson:lessons(
        id, 
        lesson_teacher_number, 
        scheduled_at, 
        status,
        lesson_songs(
          song:songs(id, title, author)
        )
      )
    `
    )
    .eq('id', id)
    .single();

  if (error || !assignment) {
    return (
      <div className="container mx-auto px-3 sm:px-4 md:px-6 py-4 sm:py-6 md:py-8">
        <div
          className="p-4 bg-destructive/10 border border-destructive/30 rounded-lg"
        >
          <p className="text-xs sm:text-sm text-destructive">Assignment not found</p>
        </div>
      </div>
    );
  }

  // Permission check
  const isAuthorized =
    profile?.is_admin ||
    profile?.is_teacher ||
    (profile?.is_student && assignment.student_id === user.id);

  if (!isAuthorized) {
    return (
      <div className="container mx-auto px-3 sm:px-4 md:px-6 py-4 sm:py-6 md:py-8">
        <div
          className="p-4 bg-destructive/10 border border-destructive/30 rounded-lg"
        >
          <p className="text-xs sm:text-sm text-destructive">
            You are not authorized to view this assignment.
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="container mx-auto px-3 sm:px-4 md:px-6 py-4 sm:py-6 md:py-8">
      <div className="mb-4 sm:mb-6">
        <Link
          href="/dashboard/assignments"
          className="text-xs sm:text-sm text-primary hover:underline"
        >
          ← Back to Assignments
        </Link>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2">
          <div
            className="bg-card rounded-lg shadow-sm border border-border p-4 sm:p-6"
          >
            <AssignmentHeader title={assignment.title} status={assignment.status} />
            <AssignmentInfo assignment={assignment as unknown as ExtendedAssignment} />
          </div>
        </div>

        <div className="lg:col-span-1">
          <HistoryTimeline
            recordId={assignment.id}
            recordType="assignment"
            title="Assignment History"
          />
        </div>
      </div>
    </div>
  );
}
