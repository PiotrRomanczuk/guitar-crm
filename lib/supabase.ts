import { createClient as createSupabaseJsClient } from '@supabase/supabase-js';
import { Database } from '@/types/database.types.generated';

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || '';
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || '';

// SSR-aware Supabase client factory
export function createClient(headers?: HeadersInit) {
	if (!supabaseUrl || !supabaseAnonKey) {
		// Return a mock client for build time
		console.warn('Supabase environment variables not set. Using mock client.');
		return createSupabaseJsClient(
			'https://placeholder.supabase.co',
			'placeholder-key'
		);
	}
	// Convert HeadersInit to Record<string, string> if needed
	let headerObj: Record<string, string> | undefined = undefined;
	if (headers) {
		if (headers instanceof Headers) {
			headerObj = Object.fromEntries(headers.entries());
		} else if (Array.isArray(headers)) {
			headerObj = Object.fromEntries(headers);
		} else {
			headerObj = headers as Record<string, string>;
		}
	}
	return createSupabaseJsClient<Database>(supabaseUrl, supabaseAnonKey, {
		global: {
			headers: headerObj,
		},
	});
}

// Default client for client-side usage
export const supabase = createClient();

// Type exports for convenience
export type Tables<T extends keyof Database['public']['Tables']> =
	Database['public']['Tables'][T]['Row'];
export type InsertTables<T extends keyof Database['public']['Tables']> =
	Database['public']['Tables'][T]['Insert'];
export type UpdateTables<T extends keyof Database['public']['Tables']> =
	Database['public']['Tables'][T]['Update'];

// Common table types
export type Profile = Tables<'profiles'>;
export type Lesson = Tables<'lessons'>;
export type Song = Tables<'songs'>;
export type LessonSong = Tables<'lesson_songs'>;
export type TaskManagement = Tables<'task_management'>;
