import { createClient } from '@supabase/supabase-js';
import { Database } from '@/types/database.types.generated';

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!;
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!;

export const supabase = createClient<Database>(supabaseUrl, supabaseAnonKey);

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
