import { createClient } from '@/lib/supabase/server';
import { NextResponse } from 'next/server';
import { logger } from '@/lib/logger';

export async function GET(request: Request, { params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const supabase = await createClient();

  const { data: { user } } = await supabase.auth.getUser();
  if (!user) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  try {
    // We want assignments that are linked to lessons that contain this song.
    // We use !inner joins to filter by the song_id in the nested lesson_songs table.
    const { data: assignments, error } = await supabase
      .from('assignments')
      .select(
        `
        id,
        title,
        status,
        due_date,
        student_id,
        lesson_id,
        student:profiles!student_id(id, full_name, email),
        lesson:lessons!inner(
          id,
          lesson_teacher_number,
          lesson_songs!inner(
            song_id
          )
        )
      `
      )
      .eq('lesson.lesson_songs.song_id', id)
      .order('due_date', { ascending: false });

    if (error) {
      logger.error('Error fetching song assignments:', error);
      return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
    }

    return NextResponse.json({ assignments });
  } catch (error) {
    logger.error('Unexpected error:', error);
    return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
  }
}
