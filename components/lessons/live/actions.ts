'use server';

import { createClient } from '@/lib/supabase/server';
import { revalidatePath } from 'next/cache';
import { z } from 'zod';

const updateNotesSchema = z.object({
  lessonId: z.string().uuid(),
  notes: z.string().max(5000, 'Notes cannot exceed 5000 characters'),
});

export async function updateLessonNotes(lessonId: string, notes: string) {
  const parsed = updateNotesSchema.safeParse({ lessonId, notes });
  if (!parsed.success) {
    throw new Error('Invalid input for lesson notes');
  }

  const supabase = await createClient();

  const { error } = await supabase
    .from('lessons')
    .update({ notes: parsed.data.notes })
    .eq('id', parsed.data.lessonId);

  if (error) {
    console.error('Error updating lesson notes:', error);
    throw new Error('Failed to save lesson notes');
  }

  revalidatePath(`/dashboard/lessons/${parsed.data.lessonId}`);
}
