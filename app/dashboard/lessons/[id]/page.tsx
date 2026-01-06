import Link from 'next/link';
import { redirect } from 'next/navigation';
import { getUserWithRolesSSR } from '@/lib/getUserWithRolesSSR';
import { createClient } from '@/lib/supabase/server';
import { LessonWithProfiles } from '@/schemas/LessonSchema';
import { Database } from '@/database.types';

import { LessonSongsList, LessonDetailsCard, LessonAssignmentsList } from '@/components/lessons';
import { StudentLessonDetailPageClient } from '@/components/lessons/student/StudentLessonDetailPageClient';
import { HistoryTimeline } from '@/components/shared/HistoryTimeline';

interface LessonDetailPageProps {
  params: Promise<{ id: string }>;
}

interface LessonDetail extends LessonWithProfiles {
  lesson_songs: {
    id: string;
    status: Database['public']['Enums']['lesson_song_status'];
    song: {
      id: string;
      title: string;
      author: string;
    } | null;
  }[];
  assignments: {
    id: string;
    title: string;
    status: Database['public']['Enums']['assignment_status'];
    due_date: string | null;
  }[];
}

async function fetchLesson(id: string): Promise<LessonDetail | null> {
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
        profile:profiles!lessons_student_id_fkey(id, full_name, email),
        teacher_profile:profiles!lessons_teacher_id_fkey(id, full_name, email),
        lesson_songs(
          id,
          status,
          song:songs(id, title, author)
        ),
        assignments(
          id,
          title,
          status,
          due_date
        )
      `
      )
      .eq('id', id)
      .single();

    if (error || !data) {
      console.error('Error fetching lesson:', error);
      return null;
    }

    return data as unknown as LessonDetail;
  } catch (err) {
    console.error('Exception fetching lesson:', err);
    return null;
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
  const { user, isAdmin, isTeacher, isStudent } = await getUserWithRolesSSR();

  if (!user) {
    redirect('/sign-in');
  }

  // If user is a student and NOT an admin/teacher, show the student view
  if (isStudent && !isAdmin && !isTeacher) {
    return <StudentLessonDetailPageClient />;
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

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2 space-y-6">
          <LessonDetailsCard
            lesson={lesson}
            canEdit={canEdit}
            canDelete={canDelete}
            onDelete={handleDeleteLesson.bind(null, id)}
          />

          <LessonSongsList
            lessonId={lesson.id!}
            lessonSongs={lesson.lesson_songs}
            canEdit={canEdit}
          />

          <LessonAssignmentsList
            lessonId={lesson.id!}
            studentId={lesson.student_id}
            teacherId={lesson.teacher_id}
            assignments={lesson.assignments}
            canEdit={canEdit}
          />
        </div>

        <div className="lg:col-span-1">
          <HistoryTimeline recordId={lesson.id!} recordType="lesson" title="Lesson History" />
        </div>
      </div>
    </div>
  );
}
