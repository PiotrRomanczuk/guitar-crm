'use server';

import { createClient } from '@/lib/supabase/server';
import { revalidatePath } from 'next/cache';
import { getUserWithRolesSSR } from '@/lib/getUserWithRolesSSR';
import { SongStatusEnum } from '@/schemas/LessonSchema';

export async function updateLessonSongStatus(lessonSongId: string, status: string) {
  const { isAdmin, isTeacher } = await getUserWithRolesSSR();

  if (!isAdmin && !isTeacher) {
    throw new Error('Unauthorized');
  }

  // Validate status against the correct enum
  const parsed = SongStatusEnum.safeParse(status);
  if (!parsed.success) {
    throw new Error(`Invalid song status: ${status}. Must be one of: ${SongStatusEnum.options.join(', ')}`);
  }

  const supabase = await createClient();

  const { error } = await supabase
    .from('lesson_songs')
    .update({ status: parsed.data })
    .eq('id', lessonSongId);

  if (error) {
    console.error('Error updating lesson song status:', error);
    throw new Error('Failed to update status');
  }

  revalidatePath('/dashboard/songs');
}
