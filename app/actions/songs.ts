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

/**
 * Normalize category name to title case
 * Examples: "rock" → "Rock", "rock music" → "Rock Music"
 */
function normalizeCategory(category: string): string {
  return category
    .trim()
    .split(' ')
    .map((word) => word.charAt(0).toUpperCase() + word.slice(1).toLowerCase())
    .join(' ');
}

export interface CategoryWithCount {
  name: string;
  count: number;
}

/**
 * Get existing song categories with usage counts
 * Returns categories sorted by usage (most popular first)
 */
export async function getExistingCategories(): Promise<CategoryWithCount[]> {
  const supabase = await createClient();

  const { data, error } = await supabase
    .from('songs')
    .select('category')
    .not('category', 'is', null)
    .neq('category', '');

  if (error) {
    console.error('Error fetching categories:', error);
    return [];
  }

  // Group by normalized category name and count usage
  const categoryMap = new Map<string, number>();

  data?.forEach((song) => {
    if (song.category) {
      const normalized = normalizeCategory(song.category);
      categoryMap.set(normalized, (categoryMap.get(normalized) || 0) + 1);
    }
  });

  // Convert to array and sort by count (most used first)
  return Array.from(categoryMap.entries())
    .map(([name, count]) => ({ name, count }))
    .sort((a, b) => b.count - a.count);
}

export interface QuickAssignResult {
  success: boolean;
  error?: string;
  isUpdate?: boolean;
}

/**
 * Quick assign a song to a lesson
 * Creates lesson_song relationship with initial status
 * If song already in lesson, updates status instead (UPSERT)
 */
export async function quickAssignSongToLesson(
  songId: string,
  lessonId: string,
  initialStatus: string = 'to_learn'
): Promise<QuickAssignResult> {
  const { isAdmin, isTeacher } = await getUserWithRolesSSR();

  if (!isAdmin && !isTeacher) {
    return { success: false, error: 'Unauthorized' };
  }

  // Validate status
  const parsed = SongStatusEnum.safeParse(initialStatus);
  if (!parsed.success) {
    return {
      success: false,
      error: `Invalid status: ${initialStatus}. Must be one of: ${SongStatusEnum.options.join(', ')}`
    };
  }

  const supabase = await createClient();

  // Check if lesson exists and belongs to teacher (RLS will handle this)
  const { data: lesson, error: lessonError } = await supabase
    .from('lessons')
    .select('id')
    .eq('id', lessonId)
    .single();

  if (lessonError || !lesson) {
    return { success: false, error: 'Lesson not found or access denied' };
  }

  // Check if song already exists in this lesson
  const { data: existing } = await supabase
    .from('lesson_songs')
    .select('id')
    .eq('lesson_id', lessonId)
    .eq('song_id', songId)
    .maybeSingle();

  const isUpdate = !!existing;

  // UPSERT: Insert if new, update if exists
  const { error } = await supabase
    .from('lesson_songs')
    .upsert(
      {
        lesson_id: lessonId,
        song_id: songId,
        status: parsed.data,
      },
      {
        onConflict: 'lesson_id,song_id',
      }
    );

  if (error) {
    console.error('Error assigning song to lesson:', error);
    return { success: false, error: 'Failed to assign song' };
  }

  // Revalidate both the lesson detail page and songs page
  revalidatePath(`/dashboard/lessons/${lessonId}`);
  revalidatePath('/dashboard/songs');

  return { success: true, isUpdate };
}
