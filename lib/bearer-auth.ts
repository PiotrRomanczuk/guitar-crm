/**
 * Bearer token authentication utilities for API routes
 */

import { createAdminClient } from '@/lib/supabase/admin';
import { createClient as createServerClient } from '@/lib/supabase/server';
import { hashApiKey } from '@/lib/api-keys';

/**
 * Extract bearer token from Authorization header
 * @param authHeader The Authorization header value
 * @returns {string | null} The token or null if not found
 */
export function extractBearerToken(authHeader?: string): string | null {
  if (!authHeader || !authHeader.startsWith('Bearer ')) {
    return null;
  }
  return authHeader.slice(7);
}

/**
 * Authenticate a request using bearer token
 * Returns the user ID and profile if authentication succeeds
 * @param bearerToken The bearer token from the Authorization header
 * @returns {Promise<{userId: string, profile: any} | null>} User info or null if authentication fails
 */
export async function authenticateWithBearerToken(bearerToken: string) {
  try {
    const supabase = createAdminClient();
    const keyHash = hashApiKey(bearerToken);

    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const { data: apiKey, error } = await (supabase as unknown as any)
      .from('api_keys')
      .select('user_id, is_active')
      .eq('key_hash', keyHash)
      .single();

    if (error || !apiKey || !apiKey.is_active) {
      console.error('[Bearer Auth] Invalid or inactive API key');
      return null;
    }

    // Update last_used_at (fire and forget)
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    void (supabase as unknown as any)
      .from('api_keys')
      .update({ last_used_at: new Date().toISOString() })
      .eq('key_hash', keyHash);

    // Get the user's profile
    const { data: profile, error: profileError } = await supabase
      .from('profiles')
      .select('*')
      .eq('id', apiKey.user_id)
      .single();

    if (profileError || !profile) {
      return null;
    }

    return {
      userId: apiKey.user_id,
      profile,
    };
  } catch (error) {
    console.error('[Bearer Auth] Error authenticating:', error);
    return null;
  }
}

/**
 * Authenticate using session cookies (for backward compatibility)
 */
export async function authenticateWithSession() {
  try {
    const supabase = await createServerClient();

    const {
      data: { user },
      error,
    } = await supabase.auth.getUser();

    if (error || !user) {
      return null;
    }

    const { data: profile, error: profileError } = await supabase
      .from('profiles')
      .select('*')
      .eq('id', user.id)
      .single();

    if (profileError || !profile) {
      return null;
    }

    return {
      userId: user.id,
      profile,
    };
  } catch (error) {
    console.error('[Session Auth] Error authenticating:', error);
    return null;
  }
}
