import { createClient } from '@supabase/supabase-js';
import { Database } from '@/database.types';
import { describe, it, expect, afterAll } from '@jest/globals';
// @ts-expect-error - node-fetch types might be missing
import nodeFetch from 'node-fetch';

// Restore real fetch for this test suite to allow network requests
global.fetch = nodeFetch;

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!;
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY!;

const supabaseAdmin = createClient<Database>(supabaseUrl, supabaseServiceKey, {
  auth: {
    autoRefreshToken: false,
    persistSession: false,
  },
});

describe('Shadow User Linking', () => {
  const testEmail = `shadow-linking-test-${Date.now()}@example.com`;
  let shadowUserId: string;
  let realUserId: string;

  afterAll(async () => {
    // Cleanup
    if (realUserId) {
      await supabaseAdmin.auth.admin.deleteUser(realUserId);
    }
    // Profile should be deleted by cascade or manually if not linked
    await supabaseAdmin.from('profiles').delete().eq('email', testEmail);
  });

  it('should link a shadow user to a real user when signing up with same email', async () => {
    // 1. Create a shadow user (profile only)
    const insertResult = await supabaseAdmin
      .from('profiles')
      .insert({
        email: testEmail,
        full_name: 'Shadow Student',
        is_student: true,
        is_teacher: false,
        is_admin: false,
        is_development: false,
      })
      .select();

    if (insertResult.error) {
      throw insertResult.error;
    }

    // Fetch the created shadow user
    const { data: shadowUser, error: fetchShadowError } = await supabaseAdmin
      .from('profiles')
      .select('*')
      .eq('email', testEmail)
      .single();

    if (fetchShadowError) {
      throw fetchShadowError;
    }
    if (!shadowUser) throw new Error('Shadow user creation returned no data');

    shadowUserId = shadowUser.id;

    // 2. Create a real user with the same email (simulates signup)
    const {
      data: { user: realUser },
      error: createError,
    } = await supabaseAdmin.auth.admin.createUser({
      email: testEmail,
      password: 'Password123!',
      email_confirm: true,
      user_metadata: { full_name: 'Real Student' },
    });

    if (createError) {
      console.error('Create user error:', createError);
      console.error('Error details:', JSON.stringify(createError, null, 2));
      throw createError;
    }
    if (!realUser) throw new Error('Failed to create real user');
    realUserId = realUser.id;

    // 3. Verify linking
    // The migration logic updates the existing profile's ID to the new auth user's ID.
    // So we should have exactly 1 profile with the realUserId.

    const { data: profiles, error: fetchError } = await supabaseAdmin
      .from('profiles')
      .select('*')
      .eq('email', testEmail);

    if (fetchError) throw fetchError;

    expect(profiles).toHaveLength(1);
    const linkedProfile = profiles![0];

    // Verify ID update
    expect(linkedProfile.id).toBe(realUserId);
    expect(linkedProfile.id).not.toBe(shadowUserId);

    // Verify data merging
    // The migration updates full_name from metadata if present
    expect(linkedProfile.full_name).toBe('Real Student');

    // Verify preservation of existing flags
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    expect((linkedProfile as any).is_student).toBe(true);
  });
});
