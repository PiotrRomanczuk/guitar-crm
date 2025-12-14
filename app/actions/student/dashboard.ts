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

  // 3. Fetch Recent Songs (from user_songs join songs)
  // Note: This depends on your schema. Assuming user_songs links users to songs.
  // If user_songs doesn't exist or is different, we might need to adjust.
  // For now, let's try to fetch from songs directly or user_songs if available.
  // Based on previous context, there is a 'songs' table.
  // Let's assume a simple fetch for now, or mock if complex join needed.
  const { data: recentSongsData } = await supabase
    .from('songs')
    .select('id, title, artist, created_at') // Using created_at as proxy for last_played if not available
    .limit(5);

  // 4. Fetch Stats
  const { count: totalSongs } = await supabase
    .from('songs') // Or user_songs
    .select('*', { count: 'exact', head: true });

  const { count: completedLessons } = await supabase
    .from('lessons')
    .select('*', { count: 'exact', head: true })
    .eq('student_id', user.id)
    .lt('scheduled_at', now);

  return {
    lastLesson: lastLessonData,
    assignments: assignmentsData || [],
    recentSongs:
      recentSongsData?.map((s) => ({
        id: s.id,
        title: s.title,
        artist: s.artist,
        last_played: s.created_at, // Proxy
      })) || [],
    stats: {
      totalSongs: totalSongs || 0,
      completedLessons: completedLessons || 0,
      activeAssignments: assignmentsData?.length || 0,
      practiceHours: 12, // Mocked
    },
  };
}
