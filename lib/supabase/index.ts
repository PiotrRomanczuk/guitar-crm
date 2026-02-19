// Barrel export for lib/supabase
// Primary export - use createBrowserClient for client-side code
export { createClient as createBrowserClient } from './client';

// Re-export types
export type {
  Database,
  Tables,
  TablesInsert,
  TablesUpdate,
} from '@/types/database.types';

// Server utilities for API routes
export {
  createApiClient,
  createAuthenticatedClient,
  getOrCreateProfile,
  authenticateRequest,
  type UserProfile,
} from './server-utils';
