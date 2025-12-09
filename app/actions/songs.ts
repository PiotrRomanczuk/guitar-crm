'use server';

import { createClient } from '@/lib/supabase/server';
import { revalidatePath } from 'next/cache';
import { getUserWithRolesSSR } from '@/lib/getUserWithRolesSSR';

export async function updateLessonSongStatus(lessonSongId: string, status: string) {
  const { isAdmin, isTeacher } = await getUserWithRolesSSR();

  if (!isAdmin && !isTeacher) {
    throw new Error('Unauthorized');
  }

  const supabase = await createClient();

  const { error } = await supabase
    .from('lesson_songs')
    .update({ status: status as 'not_started' | 'in_progress' | 'completed' })
    .eq('id', lessonSongId);

  if (error) {
    console.error('Error updating lesson song status:', error);
    throw new Error('Failed to update status');
  }

  revalidatePath('/dashboard/songs');
}
