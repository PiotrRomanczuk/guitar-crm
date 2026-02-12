'use server';

import { createClient } from '@/lib/supabase/server';
import { revalidatePath } from 'next/cache';
import { Database } from '@/database.types';

import { sendNotification, cancelPendingQueueEntries } from '@/lib/services/notification-service';

export async function sendLessonSummaryEmail(lessonId: string) {
  console.log(`[sendLessonSummaryEmail] Starting for lessonId: ${lessonId}`);
  const supabase = await createClient();

  try {
    const { data: lesson, error } = await supabase
      .from('lessons')
      .select(`
        *,
        student:profiles!lessons_student_id_fkey (
          id,
          email,
          full_name
        ),
        teacher:profiles!lessons_teacher_id_fkey (
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
    const songs = lesson.lesson_songs?.map((ls) => ({
      title: ls.song?.title || 'Unknown Song',
      artist: ls.song?.author || 'Unknown Artist',
      status: ls.status,
    })) || [];

    const result = await sendNotification({
      type: 'lesson_recap',
      recipientUserId: lesson.student_id,
      templateData: {
        studentName: lesson.student.full_name || 'Student',
        teacherName: lesson.teacher?.full_name || 'Your Teacher',
        lessonDate: new Date(lesson.scheduled_at).toLocaleDateString('en-US', {
          year: 'numeric', month: 'long', day: 'numeric',
        }),
        lessonTitle: lesson.title || 'Guitar Lesson',
        songs,
        notes: lesson.notes || '',
      },
      entityType: 'lesson',
      entityId: lessonId,
    });

    if (!result.success) {
      console.error('[sendLessonSummaryEmail] Notification service failed:', result.error);
      return { success: false, error: result.error || 'Failed to send email' };
    }

    // Cancel any pending queued recap for this lesson (from DB trigger)
    await cancelPendingQueueEntries('lesson', lessonId, 'lesson_recap');

    console.log('[sendLessonSummaryEmail] Email sent successfully via notification service');
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
