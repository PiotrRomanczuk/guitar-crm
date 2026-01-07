'use client';

import { useEffect, useState } from 'react';
import { useParams } from 'next/navigation';
import Link from 'next/link';
import { Button } from '@/components/ui/button';
import { ArrowLeft, Loader2 } from 'lucide-react';
import { createClient } from '@/lib/supabase/client';
import { LessonDetailsCard, LessonSongsList, LessonAssignmentsList } from '@/components/lessons';
import { LessonWithProfiles } from '@/schemas/LessonSchema';
import { Database } from '@/database.types';

type LessonDetail = LessonWithProfiles & {
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
};

export function StudentLessonDetailPageClient() {
  const params = useParams();
  const id = params?.id as string;
  const [lesson, setLesson] = useState<LessonDetail | null>(null);
  const [loading, setLoading] = useState(true);
  const supabase = createClient();

  useEffect(() => {
    async function fetchLesson() {
      if (!id) return;

      try {
        const {
          data: { user },
        } = await supabase.auth.getUser();
        if (!user) return;

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
          .eq('student_id', user.id)
          .maybeSingle();

        if (error) throw error;

        if (data) {
          // Transform data to match LessonDetail type
          const transformedLesson: LessonDetail = {
            ...data,
            // Ensure profile and teacher_profile are correctly typed or mapped
            // The query returns them as objects, which matches the schema
            lesson_songs: data.lesson_songs || [],
            assignments: data.assignments || [],
          } as unknown as LessonDetail; // Type assertion needed due to complex nested types

          setLesson(transformedLesson);
        } else {
          setLesson(null);
        }
      } catch (error) {
        console.error('Error fetching lesson:', error);
      } finally {
        setLoading(false);
      }
    }

    fetchLesson();
  }, [id, supabase]);

  if (loading) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <Loader2 className="w-8 h-8 animate-spin text-primary" />
      </div>
    );
  }

  if (!lesson) {
    return (
      <div className="min-h-screen bg-background p-8 flex flex-col items-center justify-center">
        <h1 className="text-2xl font-bold mb-4">Lesson not found</h1>
        <p className="text-muted-foreground mb-6">
          You don&apos;t have access to this lesson or it doesn&apos;t exist.
        </p>
        <Link href="/dashboard/lessons">
          <Button>Back to Lessons</Button>
        </Link>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background p-8">
      <div
        className="max-w-4xl mx-auto opacity-0 animate-fade-in"
        style={{ animationFillMode: 'forwards' }}
      >
        <Link
          href="/dashboard/lessons"
          className="inline-flex items-center text-sm text-muted-foreground hover:text-primary mb-6 transition-colors"
        >
          <ArrowLeft className="w-4 h-4 mr-2" />
          Back to Lessons
        </Link>

        <div className="space-y-6">
          <LessonDetailsCard
            lesson={lesson}
            canEdit={false}
            canDelete={false}
            onDelete={() => {}}
          />

          <LessonSongsList
            lessonId={lesson.id!}
            lessonSongs={lesson.lesson_songs}
            canEdit={false}
          />

          <LessonAssignmentsList
            lessonId={lesson.id!}
            studentId={lesson.student_id}
            teacherId={lesson.teacher_id}
            assignments={lesson.assignments}
            canEdit={false}
          />
        </div>
      </div>
    </div>
  );
}
