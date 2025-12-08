'use server';

import { createClient } from '@/lib/supabase/server';
import { getUserWithRolesSSR } from '@/lib/getUserWithRolesSSR';

export type StudentDashboardData = {
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
};

export async function getStudentDashboardData(): Promise<StudentDashboardData> {
  const { user } = await getUserWithRolesSSR();

  if (!user) {
    throw new Error('User not authenticated');
  }

  const supabase = await createClient();
  const now = new Date().toISOString();

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
    .neq('status', 'completed') // Assuming we only want active ones
    .order('due_date', { ascending: true })
    .limit(5);

  // 3. Fetch Recent Songs (via lesson_songs)
  // We need to join lesson_songs -> songs and lesson_songs -> lessons to get the date
  // Since Supabase join syntax can be tricky for "last unique", we might fetch a bit more and filter in JS or use a specific query.
  // A simple approach: fetch recent lesson_songs, expand song details.
  const { data: recentSongsData } = await supabase
    .from('lesson_songs')
    .select(
      `
      song_id,
      updated_at,
      songs (
        id,
        title,
        artist
      )
    `
    )
    .eq('lesson_id', lastLessonData?.id || ''); // This logic is flawed if we want songs from ANY recent lesson, not just the last one.
  // Let's try a better query: get all lesson_songs for lessons where student is this user.
  // But lesson_songs doesn't have student_id directly. It links to lesson.
  // We need to filter by lesson's student_id.
  // Supabase: .eq('lessons.student_id', user.id) works if we select lessons!inner(...)

  // Correct approach for songs:
  const { data: rawSongsData } = await supabase
    .from('lesson_songs')
    .select(
      `
      updated_at,
      songs (
        id,
        title,
        artist
      ),
      lessons!inner (
        student_id,
        scheduled_at
      )
    `
    )
    .eq('lessons.student_id', user.id)
    .order('updated_at', { ascending: false })
    .limit(20); // Fetch enough to find 5 unique

  // Process songs to get unique last 5
  const uniqueSongsMap = new Map<
    string,
    { id: string; title: string; artist: string; last_played: string }
  >();

  if (rawSongsData) {
    for (const item of rawSongsData) {
      if (item.songs && !uniqueSongsMap.has(item.songs.id)) {
        uniqueSongsMap.set(item.songs.id, {
          id: item.songs.id,
          title: item.songs.title,
          artist: item.songs.artist,
          last_played: item.updated_at, // or item.lessons.scheduled_at
        });
      }
      if (uniqueSongsMap.size >= 5) break;
    }
  }

  return {
    lastLesson: lastLessonData
      ? {
          id: lastLessonData.id,
          title: lastLessonData.title,
          scheduled_at: lastLessonData.scheduled_at,
          notes: lastLessonData.notes,
        }
      : null,
    assignments: (assignmentsData || []).map((a) => ({
      id: a.id,
      title: a.title,
      due_date: a.due_date,
      status: a.status as 'pending' | 'completed' | 'overdue',
      description: a.description,
    })),
    recentSongs: Array.from(uniqueSongsMap.values()),
  };
}
