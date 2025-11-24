// Compatibility layer for components importing from @/lib/supabase-browser
// This provides the getSupabaseBrowserClient function expected by some components
import { createClient } from './supabase/client';

// Export the function that components expect
export function getSupabaseBrowserClient() {
  return createClient();
}

// Also export createClient for direct usage
export { createClient };
export { createClient as createBrowserClient };
