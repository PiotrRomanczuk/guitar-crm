'use server';

import { createClient } from '@/lib/supabase/server';
import { revalidatePath } from 'next/cache';
import { Database } from '@/database.types';

import { sendLessonCompletedEmail } from '@/lib/email/send-lesson-email';

export async function sendLessonSummaryEmail(lessonId: string) {
  console.log(`[sendLessonSummaryEmail] Starting for lessonId: ${lessonId}`);
  const supabase = await createClient();

  try {
    const { data: lesson, error } = await supabase
      .from('lessons')
      .select(`
        *,
        student:profiles!lessons_student_id_fkey (
          email,
          full_name
        ),
        lesson_songs (
          notes,
          status,
          song:songs (
            title,
            author
          )
        )
      `)
      .eq('id', lessonId)
      .single();

    if (error) {
      console.error('Error fetching lesson details for email:', error);
      return { success: false, error: `Failed to fetch lesson details: ${error.message}` };
    }

    if (!lesson || !lesson.student) {
      return { success: false, error: 'Lesson or student not found' };
    }

    // @ts-expect-error - Supabase types are complex with joins
    const studentEmail = lesson.student.email;
    // @ts-expect-error - Supabase types are complex with joins
    const studentName = lesson.student.full_name || 'Student';

    if (!studentEmail) {
      return { success: false, error: 'Student has no email address' };
    }

    // @ts-expect-error - Supabase types are complex with joins
    const songs = lesson.lesson_songs?.map((ls) => ({
      title: ls.song?.title || 'Unknown Song',
      artist: ls.song?.author || 'Unknown Artist',
      status: ls.status,
      notes: ls.notes,
    })) || [];

    console.log(`[sendLessonSummaryEmail] Sending email to ${studentEmail}`);
    const emailResult = await sendLessonCompletedEmail({
      studentEmail,
      studentName,
      lessonDate: new Date(lesson.scheduled_at).toLocaleDateString(),
      lessonTitle: lesson.title,
      notes: lesson.notes,
      songs,
    });

    if (!emailResult) {
      console.error('[sendLessonSummaryEmail] Email sending failed: No result returned (API Key missing or Exception)');
      return { success: false, error: 'Email configuration missing or service unavailable' };
    }

    if (emailResult.error) {
        console.error('[sendLessonSummaryEmail] Email sending failed:', emailResult.error);
        // @ts-expect-error - Error type is unknown
        const errorMessage = (emailResult.error as { message?: string }).message || 'Failed to send email via provider';
        return { success: false, error: errorMessage };
    }

    console.log('[sendLessonSummaryEmail] Email sent successfully');
    return { success: true };
  } catch (error) {
    console.error('[sendLessonSummaryEmail] Exception:', error);
    return { success: false, error: 'Internal server error' };
  }
}

export async function getAvailableSongs() {
  const supabase = await createClient();

  const { data, error } = await supabase.from('songs').select('id, title, author').order('title');

  if (error) {
    console.error('Error fetching songs:', error);
    throw new Error('Failed to fetch songs');
  }

  return data;
}

export async function updateLessonSongs(lessonId: string, songIds: string[]) {
  const supabase = await createClient();

  // Get current songs to calculate diff
  const { data: currentSongs, error: fetchError } = await supabase
    .from('lesson_songs')
    .select('song_id')
    .eq('lesson_id', lessonId);

  if (fetchError) {
    console.error('Error fetching existing lesson songs:', fetchError);
    throw new Error('Failed to update lesson songs');
  }

  const currentSongIds = currentSongs.map((s) => s.song_id);

  const songsToAdd = songIds.filter((id) => !currentSongIds.includes(id));
  const songsToRemove = currentSongIds.filter((id) => !songIds.includes(id));

  // Delete removed songs
  if (songsToRemove.length > 0) {
    const { error: deleteError } = await supabase
      .from('lesson_songs')
      .delete()
      .eq('lesson_id', lessonId)
      .in('song_id', songsToRemove);

    if (deleteError) {
      console.error('Error deleting removed lesson songs:', deleteError);
      throw new Error('Failed to update lesson songs');
    }
  }

  // Insert new songs
  if (songsToAdd.length > 0) {
    const { error: insertError } = await supabase.from('lesson_songs').insert(
      songsToAdd.map((songId) => ({
        lesson_id: lessonId,
        song_id: songId,
        status: 'to_learn',
      }))
    );

    if (insertError) {
      console.error('Error inserting new lesson songs:', insertError);
      throw new Error('Failed to update lesson songs');
    }
  }

  revalidatePath(`/dashboard/lessons/${lessonId}`);
}

export async function updateLessonSongStatus(
  lessonId: string,
  songId: string,
  status: Database['public']['Enums']['lesson_song_status']
) {
  const supabase = await createClient();

  const { error } = await supabase
    .from('lesson_songs')
    .update({ status })
    .eq('lesson_id', lessonId)
    .eq('song_id', songId);

  if (error) {
    console.error('Error updating lesson song status:', error);
    throw new Error('Failed to update lesson song status');
  }

  revalidatePath(`/dashboard/lessons/${lessonId}`);
}
