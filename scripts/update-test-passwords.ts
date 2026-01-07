#!/usr/bin/env tsx
/**
 * Update test user passwords in local Supabase
 * Run with: npx tsx scripts/update-test-passwords.ts
 */

import { createClient } from '@supabase/supabase-js';

const supabaseUrl = 'http://127.0.0.1:54321';
// Local Supabase service role key (from default JWT secret)
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY || 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZS1kZW1vIiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImV4cCI6MTk4MzgxMjk5Nn0.EGIM96RAZx35lJzdJsyH-qQwv8Hdp7fsn3W0YpN81IU';

const supabase = createClient(supabaseUrl, supabaseServiceKey, {
  auth: {
    autoRefreshToken: false,
    persistSession: false
  }
});

const testUsers = [
  {
    email: 'p.romanczuk@gmail.com',
    password: 'test123_admin',
    id: '11111111-1111-1111-1111-111111111111'
  },
  {
    email: 'teacher@example.com',
    password: 'test123_teacher',
    id: '22222222-2222-2222-2222-222222222222'
  },
  {
    email: 'student1@example.com',
    password: 'test123_student',
    id: '44444444-4444-4444-4444-444444444444'
  },
  {
    email: 'student2@example.com',
    password: 'test123_student',
    id: '55555555-5555-5555-5555-555555555555'
  }
];

async function updatePasswords() {
  console.log('Updating test user passwords...\n');

  for (const user of testUsers) {
    try {
      const { data, error } = await supabase.auth.admin.updateUserById(
        user.id,
        { password: user.password }
      );

      if (error) {
        console.error(`❌ Failed to update ${user.email}:`, error.message);
      } else {
        console.log(`✅ Updated password for ${user.email}`);
      }
    } catch (err) {
      console.error(`❌ Error updating ${user.email}:`, err);
    }
  }

  console.log('\n✨ Password update complete!');
}

updatePasswords();
