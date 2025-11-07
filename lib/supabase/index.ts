// Barrel export for lib/supabase - provides compatibility for imports like @/lib/supabase
export { createClient as supabase } from './client';
export { createClient } from './client';
export { createClient as createBrowserClient } from './client';
export { createClient as getSupabaseBrowserClient } from './client';

// Re-export types for compatibility
export type {
	Database,
	Tables,
	TablesInsert,
	TablesUpdate,
} from '@/types/database.types';
export type { Tables as InsertTables } from '@/types/database.types';
