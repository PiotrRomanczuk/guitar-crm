'use server';

import { createClient as createSupabaseClient } from '@supabase/supabase-js';
import { Database } from '@/types/database.types.generated';

/**
 * Create a server-side Supabase client
 * Used in API routes and server actions
 */
export async function createClient() {
	const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || '';
	const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY || '';

	if (!supabaseUrl || !supabaseServiceKey) {
		throw new Error('Missing Supabase configuration for server client');
	}

	return createSupabaseClient<Database>(supabaseUrl, supabaseServiceKey);
}
