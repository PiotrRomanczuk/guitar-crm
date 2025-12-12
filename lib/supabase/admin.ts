import { createClient } from '@supabase/supabase-js';
import { Database } from '@/database.types';
import { getSupabaseAdminConfig } from './config';

export function createAdminClient() {
  const { url, serviceRoleKey } = getSupabaseAdminConfig();

  return createClient<Database>(url, serviceRoleKey, {
    auth: {
      autoRefreshToken: false,
      persistSession: false,
    },
  });
}
