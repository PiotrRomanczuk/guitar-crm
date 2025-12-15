'use server';

import { createClient } from '@/lib/supabase/server';
import { getUserWithRolesSSR } from '@/lib/getUserWithRolesSSR';

export type StudentDashboardData = {
  nextLesson: {
    id: string;
    title: string | null;
    scheduled_at: string;
  } | null;
  lastLesson: {
    id: string;
    title: string | null;
    scheduled_at: string;
    notes: string | null;
  } | null;
  assignments: {
    id: string;
    title: string;
    due_date: string | null;
    status: 'pending' | 'completed' | 'overdue';
    description: string | null;
  }[];
  recentSongs: {
    id: string;
    title: string;
    artist: string;
    last_played: string;
  }[];
  stats: {
    totalSongs: number;
    completedLessons: number;
    activeAssignments: number;
    practiceHours: number; // Mocked for now
  };
};

export async function getStudentDashboardData(): Promise<StudentDashboardData> {
  const { user } = await getUserWithRolesSSR();

  if (!user) {
    throw new Error('User not authenticated');
  }

  const supabase = await createClient();
  const now = new Date().toISOString();

  // 0. Fetch Next Lesson
  const { data: nextLessonData } = await supabase
    .from('lessons')
    .select('id, title, scheduled_at')
    .eq('student_id', user.id)
    .gte('scheduled_at', now)
    .order('scheduled_at', { ascending: true })
    .limit(1)
    .maybeSingle();

  // 1. Fetch Last Lesson
  const { data: lastLessonData } = await supabase
    .from('lessons')
    .select('id, title, scheduled_at, notes')
    .eq('student_id', user.id)
    .lt('scheduled_at', now)
    .order('scheduled_at', { ascending: false })
    .limit(1)
    .single();

  // 2. Fetch Pending Assignments
  const { data: assignmentsData } = await supabase
    .from('assignments')
    .select('id, title, due_date, status, description')
    .eq('student_id', user.id)
    .eq('status', 'pending')
    .order('due_date', { ascending: true })
    .limit(5);

  // 3. Fetch Recent Songs (from lesson_songs join songs)
  const { data: recentLessonSongs } = await supabase
    .from('lesson_songs')
    .select(
      `
      updated_at,
      songs (
        id,
        title,
        author,
        created_at
      ),
      lessons!inner (
        student_id
      )
    `
    )
    .eq('lessons.student_id', user.id)
    .order('updated_at', { ascending: false })
    .limit(5);

  // 4. Fetch Stats
  const { count: totalSongs } = await supabase
    .from('songs')
    .select('lesson_songs!inner(lessons!inner(student_id))', { count: 'exact', head: true })
    .eq('lesson_songs.lessons.student_id', user.id);

  const { count: completedLessons } = await supabase
    .from('lessons')
    .select('*', { count: 'exact', head: true })
    .eq('student_id', user.id)
    .lt('scheduled_at', now);

  return {
    nextLesson: nextLessonData,
    lastLesson: lastLessonData,
    assignments: assignmentsData || [],
    recentSongs:
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      recentLessonSongs?.map((ls: any) => ({
        id: ls.songs.id,
        title: ls.songs.title,
        artist: ls.songs.author,
        last_played: ls.updated_at,
      })) || [],
    stats: {
      totalSongs: totalSongs || 0,
      completedLessons: completedLessons || 0,
      activeAssignments: assignmentsData?.length || 0,
      practiceHours: 12, // Mocked
    },
  };
}
