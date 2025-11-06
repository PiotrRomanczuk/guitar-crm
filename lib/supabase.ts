import { createClient as supabaseCreateClient } from '@supabase/supabase-js';
import { Database } from '@/types/database.types.generated';

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || '';
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || '';

// Create a fallback client for build time

export const createSupabaseClient = () => {
	if (!supabaseUrl || !supabaseAnonKey) {
		// Return a mock client for build time
		console.warn('Supabase environment variables not set. Using mock client.');
		return supabaseCreateClient(
			'https://placeholder.supabase.co',
			'placeholder-key'
		);
	}
	return supabaseCreateClient<Database>(supabaseUrl, supabaseAnonKey);
};

export const supabase = createSupabaseClient();

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
export type UserFavorite = Tables<'user_favorites'>;
