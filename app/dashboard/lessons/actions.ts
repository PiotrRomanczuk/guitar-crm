'use server';

import { createClient } from '@/lib/supabase/server';
import { revalidatePath } from 'next/cache';
import { Database } from '@/database.types';

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
