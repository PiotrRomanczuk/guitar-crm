'use server';

import { createClient } from '@/lib/supabase/server';
import type { AIGeneration, AIGenerationFilters } from '@/types/ai-generation';

const DEFAULT_PAGE_SIZE = 20;

export async function getAIGenerations(filters: AIGenerationFilters = {}): Promise<{
  data: AIGeneration[];
  total: number;
  error?: string;
}> {
  try {
    const supabase = await createClient();
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return { data: [], total: 0, error: 'Unauthorized' };

    const page = filters.page ?? 0;
    const pageSize = filters.pageSize ?? DEFAULT_PAGE_SIZE;
    const from = page * pageSize;
    const to = from + pageSize - 1;

    let query = supabase
      .from('ai_generations')
      .select('*', { count: 'exact' })
      .order('created_at', { ascending: false })
      .range(from, to);

    if (filters.generationType) {
      query = query.eq('generation_type', filters.generationType);
    }
    if (filters.isStarred !== undefined) {
      query = query.eq('is_starred', filters.isStarred);
    }
    if (filters.isSuccessful !== undefined) {
      query = query.eq('is_successful', filters.isSuccessful);
    }
    if (filters.search) {
      query = query.ilike('output_content', `%${filters.search}%`);
    }

    const { data, count, error } = await query;

    if (error) {
      console.error('[AI History] getAIGenerations error:', error);
      return { data: [], total: 0, error: error.message };
    }

    return { data: (data as AIGeneration[]) ?? [], total: count ?? 0 };
  } catch (error) {
    console.error('[AI History] Unexpected error:', error);
    return {
      data: [],
      total: 0,
      error: error instanceof Error ? error.message : 'Failed to fetch generations',
    };
  }
}

export async function toggleAIGenerationStar(id: string): Promise<{ success: boolean; error?: string }> {
  try {
    const supabase = await createClient();

    const { data: existing, error: fetchError } = await supabase
      .from('ai_generations')
      .select('is_starred')
      .eq('id', id)
      .single();

    if (fetchError || !existing) {
      return { success: false, error: fetchError?.message ?? 'Not found' };
    }

    const { error } = await supabase
      .from('ai_generations')
      .update({ is_starred: !existing.is_starred })
      .eq('id', id);

    if (error) {
      return { success: false, error: error.message };
    }

    return { success: true };
  } catch (error) {
    console.error('[AI History] toggleStar error:', error);
    return {
      success: false,
      error: error instanceof Error ? error.message : 'Failed to toggle star',
    };
  }
}

export async function deleteAIGeneration(id: string): Promise<{ success: boolean; error?: string }> {
  try {
    const supabase = await createClient();

    const { error } = await supabase
      .from('ai_generations')
      .delete()
      .eq('id', id);

    if (error) {
      return { success: false, error: error.message };
    }

    return { success: true };
  } catch (error) {
    console.error('[AI History] delete error:', error);
    return {
      success: false,
      error: error instanceof Error ? error.message : 'Failed to delete generation',
    };
  }
}
