'use server';

import { createServerClient } from '@supabase/ssr';
import { cookies } from 'next/headers';
import { Database } from '@/types/database.types.generated';

/**
 * Create a server-side Supabase client with cookie-based auth
 * Used in API routes and server actions
 * This client respects RLS policies and user authentication
 */
export async function createClient() {
	const cookieStore = await cookies();
	const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || '';
	const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || '';

	if (!supabaseUrl || !supabaseAnonKey) {
		throw new Error('Missing Supabase configuration for server client');
	}

	return createServerClient<Database>(supabaseUrl, supabaseAnonKey, {
		cookies: {
			getAll() {
				return cookieStore.getAll();
			},
			setAll(cookiesToSet) {
				try {
					cookiesToSet.forEach(({ name, value, options }) =>
						cookieStore.set(name, value, options)
					);
				} catch {
					// The `setAll` method was called from a Server Component.
					// This can be ignored if you have middleware refreshing
					// user sessions.
				}
			},
		},
	});
}

/**
 * Create a server-side Supabase admin client
 * Bypasses RLS - use only for admin operations
 */
export async function createAdminClient() {
	const { createClient: createSupabaseClient } = await import(
		'@supabase/supabase-js'
	);
	const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || '';
	const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY || '';

	if (!supabaseUrl || !supabaseServiceKey) {
		throw new Error('Missing Supabase configuration for admin client');
	}

	return createSupabaseClient<Database>(supabaseUrl, supabaseServiceKey);
}
