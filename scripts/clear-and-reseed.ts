#!/usr/bin/env tsx

/**
 * Clear all data and reseed with correct development credentials
 * Usage: npx tsx scripts/clear-and-reseed.ts
 */

import { createClient } from '@supabase/supabase-js';
import { config } from 'dotenv';

// Load environment variables
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

// Development users with correct credentials
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

async function clearAllData() {
  console.log('🗑️  Step 1: Clearing existing data...\n');

  try {
    // Get all existing users from auth
    const {
      data: { users },
      error: listError,
    } = await supabase.auth.admin.listUsers();

    if (listError) {
      console.error('Error listing users:', listError.message);
      return false;
    }

    console.log(`Found ${users.length} existing users to delete`);

    // Delete all users
    for (const user of users) {
      console.log(`  Deleting user: ${user.email}`);
      const { error } = await supabase.auth.admin.deleteUser(user.id);
      if (error) {
        console.error(`  ❌ Failed to delete ${user.email}:`, error.message);
      } else {
        console.log(`  ✅ Deleted ${user.email}`);
      }
    }

    console.log('\n✅ All existing users deleted\n');
    return true;
  } catch (err) {
    console.error('❌ Error clearing data:', err);
    return false;
  }
}

async function createUsers() {
  console.log('👥 Step 2: Creating development users...\n');

  const createdUsers = [];

  for (const user of devUsers) {
    try {
      console.log(`Creating user: ${user.email}`);

      // Create user in auth.users
      const { data: authUser, error: authError } = await supabase.auth.admin.createUser({
        email: user.email,
        password: user.password,
        email_confirm: true,
        user_metadata: {
          full_name: user.full_name,
        },
      });

      if (authError) {
        console.error(`  ❌ Failed to create ${user.email}:`, authError.message);
        continue;
      }

      console.log(`  ✅ Created auth user: ${user.email}`);

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
        console.error(`  ❌ Failed to update profile for ${user.email}:`, profileError.message);
      } else {
        console.log(`  ✅ Updated profile with roles for ${user.email}`);
      }

      createdUsers.push({
        ...user,
        id: authUser.user.id,
      });
    } catch (err) {
      console.error(`  ❌ Unexpected error for ${user.email}:`, err);
    }
  }

  console.log(`\n✅ Created ${createdUsers.length} users\n`);
  return createdUsers;
}

async function displayResults() {
  console.log('📊 Step 3: Verifying seeded users...\n');

  const { data: profiles, error } = await supabase
    .from('profiles')
    .select('email, full_name, is_admin, is_teacher, is_student')
    .order('email');

  if (error) {
    console.error('Error fetching profiles:', error.message);
    return;
  }

  console.log('Seeded users:');
  console.log('═══════════════════════════════════════════════════════════\n');

  profiles?.forEach((profile) => {
    const roles = [];
    if (profile.is_admin) roles.push('Admin');
    if (profile.is_teacher) roles.push('Teacher');
    if (profile.is_student) roles.push('Student');

    console.log(`📧 ${profile.email}`);
    console.log(`   Name: ${profile.full_name}`);
    console.log(`   Roles: ${roles.join(', ') || 'None'}`);
    console.log('');
  });

  console.log('═══════════════════════════════════════════════════════════\n');
}

async function main() {
  console.log('🌱 CLEAR AND RESEED DATABASE');
  console.log('═══════════════════════════════════════════════════════════\n');

  // Step 1: Clear all data
  const cleared = await clearAllData();
  if (!cleared) {
    console.error('❌ Failed to clear data. Exiting.');
    process.exit(1);
  }

  // Step 2: Create users
  const users = await createUsers();
  if (users.length === 0) {
    console.error('❌ Failed to create any users. Exiting.');
    process.exit(1);
  }

  // Step 3: Display results
  await displayResults();

  console.log('✅ Database cleared and reseeded successfully!');
  console.log('\nYou can now log in with:');
  console.log('  Admin: p.romanczuk@gmail.com / test123_admin');
  console.log('  Teacher: teacher@example.com / test123_teacher');
  console.log('  Student: student@example.com / test123_student\n');
}

main();
