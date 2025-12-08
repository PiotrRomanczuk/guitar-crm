import { createClient } from '@/lib/supabase/server';
import { NextResponse } from 'next/server';

export async function GET(request: Request, { params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const supabase = await createClient();

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
        priority,
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
      console.error('Error fetching song assignments:', error);
      return NextResponse.json({ error: error.message }, { status: 500 });
    }

    return NextResponse.json({ assignments });
  } catch (error) {
    console.error('Unexpected error:', error);
    return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
  }
}
