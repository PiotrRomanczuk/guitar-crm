'use server';

import { createClient } from '@/lib/supabase/server';
import { generateApiKey, hashApiKey } from '@/lib/api-keys';
import { revalidatePath } from 'next/cache';

export interface ApiKey {
  id: string;
  name: string;
  created_at: string;
  last_used_at: string | null;
  is_active: boolean;
}

export async function getApiKeys(): Promise<{ success: boolean; data?: ApiKey[]; error?: string }> {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    return { success: false, error: 'Unauthorized' };
  }

  const { data, error } = await supabase
    .from('api_keys')
    .select('id, name, created_at, last_used_at, is_active')
    .eq('user_id', user.id)
    .order('created_at', { ascending: false });

  if (error) {
    console.error('Error fetching API keys:', error);
    return { success: false, error: 'Failed to fetch API keys' };
  }

  return { success: true, data };
}

export async function createApiKey(
  name: string
): Promise<{ success: boolean; apiKey?: string; error?: string }> {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    return { success: false, error: 'Unauthorized' };
  }

  const plainKey = generateApiKey();
  const keyHash = hashApiKey(plainKey);

  const { error } = await supabase.from('api_keys').insert({
    user_id: user.id,
    name,
    key_hash: keyHash,
    is_active: true,
  });

  if (error) {
    console.error('Error creating API key:', error);
    return { success: false, error: 'Failed to create API key' };
  }

  revalidatePath('/dashboard/settings');
  return { success: true, apiKey: plainKey };
}

export async function revokeApiKey(
  id: string
): Promise<{ success: boolean; error?: string }> {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    return { success: false, error: 'Unauthorized' };
  }

  const { error } = await supabase
    .from('api_keys')
    .delete()
    .eq('id', id)
    .eq('user_id', user.id);

  if (error) {
    console.error('Error revoking API key:', error);
    return { success: false, error: 'Failed to revoke API key' };
  }

  revalidatePath('/dashboard/settings');
  return { success: true };
}
