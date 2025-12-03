import { createClient } from '@supabase/supabase-js';
import { Database } from '../../types/database.types';
import dotenv from 'dotenv';
import path from 'path';

// Load test environment variables
dotenv.config({ path: path.resolve(__dirname, '../../.env.test') });

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!;
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY!;

if (!supabaseUrl || !supabaseServiceKey) {
  throw new Error('Missing Supabase environment variables');
}

const supabase = createClient<Database>(supabaseUrl, supabaseServiceKey);

describe('Shadow User Reproduction', () => {
  const testEmail = `shadow_test_${Date.now()}@example.com`;

  beforeAll(async () => {
    // Clean up any existing test data
    await supabase.from('profiles').delete().eq('email', testEmail);
  });

  afterAll(async () => {
    // Clean up
    const { data } = await supabase.from('profiles').select('user_id').eq('email', testEmail).single();
    if (data?.user_id) {
        await supabase.auth.admin.deleteUser(data.user_id).catch(() => {});
    }
    await supabase.from('profiles').delete().eq('email', testEmail);
  });

  it('should fail to link existing profile when creating new auth user', async () => {
    // 1. Create a "Shadow Profile" (profile without auth user)
    const { error: profileError } = await supabase.from('profiles').insert({
      user_id: null, 
      email: testEmail,
      username: 'Shadow User',
      isStudent: true,
      firstName: 'Shadow',
      lastName: 'User'
    });

    if (profileError) {
      console.error('Profile creation error:', profileError);
    }
    expect(profileError).toBeNull();

    // 2. Create the Auth User (simulating user signing up)
    const { data: authData, error: authError } = await supabase.auth.admin.createUser({
      email: testEmail,
      password: 'password123',
      email_confirm: true,
      user_metadata: { full_name: 'Shadow User' }
    });

    if (authError) {
        console.error('Auth creation error:', authError);
    }
    expect(authError).toBeNull();
    expect(authData.user).not.toBeNull();
    
    const newUserId = authData.user!.id;

    // 3. Check if the profile was updated with the new user ID
    const { data: profile, error: fetchError } = await supabase
      .from('profiles')
      .select('*')
      .eq('email', testEmail)
      .single();

    expect(fetchError).toBeNull();
    expect(profile).not.toBeNull();

    console.log('Profile after signup:', profile);

    // This expectation should FAIL if the bug is present
    expect(profile!.user_id).toBe(newUserId);
  });
});
