'use server';

import { createClient } from '@/lib/supabase/server';

/**
 * Fetches distinct, non-empty author names from the songs table.
 * Used for fuzzy matching during CSV song import.
 */
export async function getDistinctAuthors(): Promise<string[]> {
  const supabase = await createClient();

  const { data, error } = await supabase
    .from('songs')
    .select('author')
    .not('author', 'is', null)
    .neq('author', '')
    .is('deleted_at', null)
    .order('author');

  if (error) {
    console.error('Error fetching distinct authors:', error);
    return [];
  }

  const unique = [...new Set(data.map((row) => row.author as string))];
  return unique;
}
