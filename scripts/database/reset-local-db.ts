#!/usr/bin/env tsx

/**
 * Reset local database and seed with correct development credentials
 * This uses LOCAL Supabase (127.0.0.1:54321) not remote
 */

import { createClient } from '@supabase/supabase-js';

// LOCAL Supabase credentials (hardcoded for local dev)
const SUPABASE_URL = 'http://127.0.0.1:54321';
const SUPABASE_SERVICE_KEY =
  'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZS1kZW1vIiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImV4cCI6MTk4MzgxMjk5Nn0.EGIM96RAZx35lJzdJsyH-qQwv8Hdp7fsn3W0YpN81IU';

const supabase = createClient(SUPABASE_URL, SUPABASE_SERVICE_KEY, {
  auth: {
    autoRefreshToken: false,
    persistSession: false,
  },
});

// Development users from DEV_USER_CREDENTIALS.md
const DEV_USERS = [
  {
    email: 'p.romanczuk@gmail.com',
    password: 'test123_admin',
    full_name: 'Admin User',
    is_admin: true,
    is_teacher: true,
    is_student: false,
  },
  {
    email: 'teacher@example.com',
    password: 'test123_teacher',
    full_name: 'Teacher User',
    is_admin: false,
    is_teacher: true,
    is_student: false,
  },
  {
    email: 'student@example.com',
    password: 'test123_student',
    full_name: 'Student User',
    is_admin: false,
    is_teacher: false,
    is_student: true,
  },
  {
    email: 'teststudent1@example.com',
    password: 'test123_student',
    full_name: 'Test Student One',
    is_admin: false,
    is_teacher: false,
    is_student: true,
  },
  {
    email: 'teststudent2@example.com',
    password: 'test123_student',
    full_name: 'Test Student Two',
    is_admin: false,
    is_teacher: false,
    is_student: true,
  },
  {
    email: 'teststudent3@example.com',
    password: 'test123_student',
    full_name: 'Test Student Three',
    is_admin: false,
    is_teacher: false,
    is_student: true,
  },
];

async function resetDatabase() {
  console.log('🧹 Resetting local database...\n');

  try {
    // 1. Delete all data from tables (in correct order due to foreign keys)
    console.log('📝 Step 1: Deleting existing data...');

    const tables = ['lesson_songs', 'assignments', 'lessons', 'songs', 'profiles'];

    for (const table of tables) {
      const { error } = await supabase
        .from(table)
        .delete()
        .neq('id', '00000000-0000-0000-0000-000000000000');
      if (error && error.code !== 'PGRST116') {
        // PGRST116 = not found (ok if table empty)
        console.log(`   ⚠️  Could not clear ${table}: ${error.message}`);
      } else {
        console.log(`   ✅ Cleared ${table}`);
      }
    }

    // 2. Delete all auth users (this will cascade to profiles)
    console.log('\n📝 Step 2: Deleting auth users...');
    const { data: existingUsers, error: listError } = await supabase.auth.admin.listUsers();

    if (listError) {
      console.error('   ❌ Failed to list users:', listError.message);
    } else {
      for (const user of existingUsers.users) {
        const { error: deleteError } = await supabase.auth.admin.deleteUser(user.id);
        if (deleteError) {
          console.log(`   ⚠️  Could not delete user ${user.email}: ${deleteError.message}`);
        } else {
          console.log(`   ✅ Deleted user: ${user.email}`);
        }
      }
    }

    // 3. Create new users with correct credentials
    console.log('\n📝 Step 3: Creating development users...');

    for (const userData of DEV_USERS) {
      // Create auth user
      const { data: authData, error: signUpError } = await supabase.auth.admin.createUser({
        email: userData.email,
        password: userData.password,
        email_confirm: true,
        user_metadata: {
          full_name: userData.full_name,
        },
      });

      if (signUpError) {
        console.log(`   ❌ Failed to create ${userData.email}: ${signUpError.message}`);
        continue;
      }

      // Create/update profile with roles
      const { error: profileError } = await supabase.from('profiles').upsert(
        {
          id: authData.user.id,
          email: userData.email,
          full_name: userData.full_name,
          is_admin: userData.is_admin,
          is_teacher: userData.is_teacher,
          is_student: userData.is_student,
          is_development: false,
        },
        { onConflict: 'id' }
      );

      if (profileError) {
        console.log(`   ⚠️  Profile error for ${userData.email}: ${profileError.message}`);
      } else {
        const roles = [];
        if (userData.is_admin) roles.push('admin');
        if (userData.is_teacher) roles.push('teacher');
        if (userData.is_student) roles.push('student');
        console.log(`   ✅ Created: ${userData.email} (${roles.join(', ')})`);
      }
    }

    // 4. Verify users were created
    console.log('\n📝 Step 4: Verifying users...');
    const { data: profiles, error: profilesError } = await supabase
      .from('profiles')
      .select('email, full_name, is_admin, is_teacher, is_student')
      .order('email');

    if (profilesError) {
      console.log('   ❌ Failed to verify:', profilesError.message);
    } else {
      console.log(`   ✅ Found ${profiles.length} profiles:\n`);
      profiles.forEach((p) => {
        const roles = [];
        if (p.is_admin) roles.push('admin');
        if (p.is_teacher) roles.push('teacher');
        if (p.is_student) roles.push('student');
        console.log(`      - ${p.email}: ${p.full_name} (${roles.join(', ')})`);
      });
    }

    console.log('\n✅ Database reset complete!');
    console.log('\n📋 You can now sign in with these credentials:');
    console.log('   Admin: p.romanczuk@gmail.com / test123_admin');
    console.log('   Teacher: teacher@example.com / test123_teacher');
    console.log('   Student: student@example.com / test123_student');
  } catch (error) {
    console.error('\n❌ Unexpected error:', error);
    process.exit(1);
  }
}

resetDatabase();
