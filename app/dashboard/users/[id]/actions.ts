'use server';

import { createClient } from '@/lib/supabase/server';
import { Database } from '@/database.types';

export type RepertoireItem = {
  songId: string;
  title: string;
  author: string;
  status: Database['public']['Enums']['lesson_song_status'];
  lastPlayed: string; // date of the lesson
};

export type AssignmentItem = {
  id: string;
  title: string;
  description: string | null;
  status: Database['public']['Enums']['assignment_status'];
  dueDate: string | null;
  createdAt: string;
};

export async function getStudentRepertoire(studentId: string): Promise<RepertoireItem[]> {
  const supabase = await createClient();

  const { data, error } = await supabase
    .from('lesson_songs')
    .select(`
      status,
      created_at,
      songs (
        id,
        title,
        author
      ),
      lessons!inner (
        student_id,
        scheduled_at
      )
    `)
    .eq('lessons.student_id', studentId)
    .order('created_at', { ascending: false });

  if (error) {
    console.error('Error fetching student repertoire:', error);
    throw new Error('Failed to fetch student repertoire');
  }

  // Process to get unique songs with their latest status
  const songMap = new Map<string, RepertoireItem>();

  data.forEach((item) => {
    if (!item.songs) return;

    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const song = Array.isArray(item.songs) ? item.songs[0] : (item.songs as any);
    if (!song) return;

    const songId = song.id;
    // Since we ordered by created_at desc, the first time we see a song is the latest one
    if (!songMap.has(songId)) {
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      const lesson = Array.isArray(item.lessons) ? item.lessons[0] : (item.lessons as any);
      
      songMap.set(songId, {
        songId: song.id,
        title: song.title,
        author: song.author,
        status: item.status,
        lastPlayed: lesson?.scheduled_at || item.created_at,
      });
    }
  });

  return Array.from(songMap.values());
}

export async function getStudentAssignments(studentId: string): Promise<AssignmentItem[]> {
  const supabase = await createClient();

  const { data, error } = await supabase
    .from('assignments')
    .select('*')
    .eq('student_id', studentId)
    .order('due_date', { ascending: true });

  if (error) {
    console.error('Error fetching student assignments:', error);
    throw new Error('Failed to fetch student assignments');
  }

  return data.map((item) => ({
    id: item.id,
    title: item.title,
    description: item.description,
    status: item.status,
    dueDate: item.due_date,
    createdAt: item.created_at,
  }));
}
