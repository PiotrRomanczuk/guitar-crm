#!/usr/bin/env tsx

/**
 * Complete database cleanup - removes ALL profiles and auth users, then reseeds
 * Usage: npx tsx scripts/complete-cleanup.ts
 */

import { createClient } from '@supabase/supabase-js';
import { config } from 'dotenv';

config({ path: '.env.local' });

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

if (!supabaseUrl || !supabaseServiceKey) {
  console.error('❌ Missing required environment variables');
  process.exit(1);
}

const supabase = createClient(supabaseUrl, supabaseServiceKey, {
  auth: {
    autoRefreshToken: false,
    persistSession: false,
  },
});

const devUsers = [
  {
    email: 'p.romanczuk@gmail.com',
    password: 'test123_admin',
    full_name: 'Admin User',
    notes: 'Has full system access',
    is_admin: true,
    is_teacher: true,
    is_student: false,
  },
  {
    email: 'teacher@example.com',
    password: 'test123_teacher',
    full_name: 'Test Teacher',
    notes: 'For testing teacher functionality',
    is_admin: false,
    is_teacher: true,
    is_student: false,
  },
  {
    email: 'student@example.com',
    password: 'test123_student',
    full_name: 'Test Student',
    notes: 'For testing student views',
    is_admin: false,
    is_teacher: false,
    is_student: true,
  },
  {
    email: 'teststudent1@example.com',
    password: 'test123_student',
    full_name: 'Test Student 1',
    notes: 'Sample active student',
    is_admin: false,
    is_teacher: false,
    is_student: true,
  },
  {
    email: 'teststudent2@example.com',
    password: 'test123_student',
    full_name: 'Test Student 2',
    notes: 'Sample active student',
    is_admin: false,
    is_teacher: false,
    is_student: true,
  },
  {
    email: 'teststudent3@example.com',
    password: 'test123_student',
    full_name: 'Test Student 3',
    notes: 'Sample active student',
    is_admin: false,
    is_teacher: false,
    is_student: true,
  },
];

async function completeCleanup() {
  console.log('🧹 COMPLETE DATABASE CLEANUP');
  console.log('═══════════════════════════════════════════════════════════\n');

  // Step 1: Delete all auth users
  console.log('🗑️  Step 1: Deleting all auth users...\n');

  const {
    data: { users },
    error: listError,
  } = await supabase.auth.admin.listUsers();

  if (listError) {
    console.error('Error listing users:', listError.message);
    return false;
  }

  console.log(`Found ${users.length} auth users to delete`);

  for (const user of users) {
    console.log(`  Deleting auth user: ${user.email}`);
    const { error } = await supabase.auth.admin.deleteUser(user.id);
    if (error) {
      console.error(`  ❌ Failed:`, error.message);
    } else {
      console.log(`  ✅ Deleted`);
    }
  }

  // Step 2: Delete all orphaned profiles (profiles without auth users)
  console.log('\n🗑️  Step 2: Deleting all profiles from database...\n');

  const { data: profiles, error: profilesError } = await supabase
    .from('profiles')
    .select('id, email');

  if (profilesError) {
    console.error('Error listing profiles:', profilesError.message);
  } else {
    console.log(`Found ${profiles.length} profiles to delete`);

    const { error: deleteError } = await supabase
      .from('profiles')
      .delete()
      .neq('id', '00000000-0000-0000-0000-000000000000'); // Delete all (using dummy condition)

    if (deleteError) {
      console.error('  ❌ Failed to delete profiles:', deleteError.message);
    } else {
      console.log(`  ✅ Deleted all ${profiles.length} profiles`);
    }
  }

  console.log('\n✅ Complete cleanup finished!\n');
  return true;
}

async function createUsers() {
  console.log('👥 Step 3: Creating development users...\n');

  const createdUsers = [];

  for (const user of devUsers) {
    try {
      console.log(`Creating user: ${user.email}`);

      const { data: authUser, error: authError } = await supabase.auth.admin.createUser({
        email: user.email,
        password: user.password,
        email_confirm: true,
        user_metadata: {
          full_name: user.full_name,
        },
      });

      if (authError) {
        console.error(`  ❌ Failed:`, authError.message);
        continue;
      }

      console.log(`  ✅ Created auth user`);

      // Update profile with roles
      const { error: profileError } = await supabase
        .from('profiles')
        .update({
          full_name: user.full_name,
          notes: user.notes,
          is_admin: user.is_admin,
          is_teacher: user.is_teacher,
          is_student: user.is_student,
          is_development: true,
        })
        .eq('id', authUser.user.id);

      if (profileError) {
        console.error(`  ❌ Failed to update profile:`, profileError.message);
      } else {
        console.log(`  ✅ Updated profile with roles\n`);
      }

      createdUsers.push({
        ...user,
        id: authUser.user.id,
      });
    } catch (err) {
      console.error(`  ❌ Unexpected error:`, err);
    }
  }

  console.log(`✅ Created ${createdUsers.length} users\n`);
  return createdUsers;
}

async function displayResults() {
  console.log('📊 Step 4: Final verification...\n');

  const { data: profiles, error } = await supabase
    .from('profiles')
    .select('email, full_name, is_admin, is_teacher, is_student')
    .order('email');

  if (error) {
    console.error('Error fetching profiles:', error.message);
    return;
  }

  console.log('═══════════════════════════════════════════════════════════');
  console.log(`                    ${profiles.length} SEEDED USERS`);
  console.log('═══════════════════════════════════════════════════════════\n');

  profiles?.forEach((profile) => {
    const roles = [];
    if (profile.is_admin) roles.push('Admin');
    if (profile.is_teacher) roles.push('Teacher');
    if (profile.is_student) roles.push('Student');

    console.log(`📧 ${profile.email}`);
    console.log(`   Name: ${profile.full_name}`);
    console.log(`   Roles: ${roles.join(', ')}`);
    console.log('');
  });

  console.log('═══════════════════════════════════════════════════════════\n');
}

async function main() {
  console.clear();

  // Step 1 & 2: Complete cleanup
  const cleaned = await completeCleanup();
  if (!cleaned) {
    console.error('❌ Cleanup failed. Exiting.');
    process.exit(1);
  }

  // Step 3: Create users
  const users = await createUsers();
  if (users.length === 0) {
    console.error('❌ Failed to create any users. Exiting.');
    process.exit(1);
  }

  // Step 4: Display results
  await displayResults();

  console.log('🎉 SUCCESS! Database is clean and reseeded.\n');
  console.log('You can now log in with these credentials:');
  console.log('═══════════════════════════════════════════════════════════');
  console.log('👤 Admin:   p.romanczuk@gmail.com     / test123_admin');
  console.log('👨‍🏫 Teacher: teacher@example.com        / test123_teacher');
  console.log('👨‍🎓 Student: student@example.com        / test123_student');
  console.log('═══════════════════════════════════════════════════════════\n');
}

main();
