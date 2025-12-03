// Compatibility layer for components importing from @/lib/supabase
// This file re-exports the browser client with the 'supabase' name
import { createClient } from './supabase/client';

// Export as named export for components expecting { supabase }
export const supabase = createClient();

// Also export the factory function
export { createClient };
export { createClient as createBrowserClient };

// Re-export types for compatibility
export type { Database, Tables, TablesInsert, TablesUpdate } from '@/types/database.types';
export type { Tables as InsertTables } from '@/types/database.types';
