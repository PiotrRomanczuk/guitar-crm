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
