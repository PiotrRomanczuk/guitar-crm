'use server';

import { createClient } from '@/lib/supabase/server';
import { Database } from '@/database.types';

export type SongStudentItem = {
  studentId: string;
  name: string;
  status: Database['public']['Enums']['lesson_song_status'];
  lastPlayed: string;
};

export async function getSongStudents(songId: string): Promise<SongStudentItem[]> {
  const supabase = await createClient();

  const { data, error } = await supabase
    .from('lesson_songs')
    .select(
      `
      status,
      created_at,
      lessons!inner (
        scheduled_at,
        profiles!lessons_student_id_fkey!inner (
          id,
          full_name
        )
      )
    `
    )
    .eq('song_id', songId)
    .order('created_at', { ascending: false });

  if (error) {
    console.error('Error fetching song students:', error);
    throw new Error('Failed to fetch song students');
  }

  const studentMap = new Map<string, SongStudentItem>();

  data.forEach((item) => {
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const lesson = Array.isArray(item.lessons) ? item.lessons[0] : (item.lessons as any);
    if (!lesson || !lesson.profiles) return;

    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const student = Array.isArray(lesson.profiles) ? lesson.profiles[0] : (lesson.profiles as any);
    if (!student) return;

    const studentId = student.id;

    // Since ordered by created_at desc, first one is latest
    if (!studentMap.has(studentId)) {
      const name = student.full_name || 'Unknown Student';

      studentMap.set(studentId, {
        studentId,
        name,
        status: item.status,
        lastPlayed: lesson.scheduled_at || item.created_at,
      });
    }
  });

  return Array.from(studentMap.values());
}
