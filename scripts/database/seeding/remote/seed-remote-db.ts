#!/usr/bin/env tsx

/**
 * Seed remote Supabase database with development data
 * This mirrors the local database setup with correct credentials
 */

import { createClient } from '@supabase/supabase-js';
import { config } from 'dotenv';

// Load environment variables
config({ path: '.env.local' });

const SUPABASE_URL = process.env.SUPABASE_URL!;
const SUPABASE_SERVICE_KEY = process.env.SUPABASE_SERVICE_ROLE_KEY!;

if (!SUPABASE_URL || !SUPABASE_SERVICE_KEY) {
  console.error('❌ Missing SUPABASE_URL or SUPABASE_SERVICE_ROLE_KEY in .env.local');
  process.exit(1);
}

const supabase = createClient(SUPABASE_URL, SUPABASE_SERVICE_KEY, {
  auth: {
    autoRefreshToken: false,
    persistSession: false,
  },
});

// Development users matching DEV_USER_CREDENTIALS.md
const DEV_USERS = [
  {
    email: 'p.romanczuk@gmail.com',
    password: 'test123_admin',
    full_name: 'Piotr Romanczuk',
    is_admin: true,
    is_teacher: true,
    is_student: false,
  },
  {
    email: 'teacher@example.com',
    password: 'test123_teacher',
    full_name: 'Test Teacher',
    is_admin: false,
    is_teacher: true,
    is_student: false,
  },
  {
    email: 'student@example.com',
    password: 'test123_student',
    full_name: 'Test Student',
    is_admin: false,
    is_teacher: false,
    is_student: true,
  },
  {
    email: 'teststudent1@example.com',
    password: 'test123_student',
    full_name: 'Test Student 1',
    is_admin: false,
    is_teacher: false,
    is_student: true,
  },
  {
    email: 'teststudent2@example.com',
    password: 'test123_student',
    full_name: 'Test Student 2',
    is_admin: false,
    is_teacher: false,
    is_student: true,
  },
  {
    email: 'teststudent3@example.com',
    password: 'test123_student',
    full_name: 'Test Student 3',
    is_admin: false,
    is_teacher: false,
    is_student: true,
  },
];

const SAMPLE_SONGS = [
  {
    title: 'Wonderwall',
    author: 'Oasis',
    level: 'beginner',
    key: 'Em',
    ultimate_guitar_link: 'https://tabs.ultimate-guitar.com/tab/oasis/wonderwall-chords-64134',
  },
  {
    title: 'Hotel California',
    author: 'Eagles',
    level: 'intermediate',
    key: 'Bm',
    ultimate_guitar_link:
      'https://tabs.ultimate-guitar.com/tab/eagles/hotel-california-chords-16039',
  },
  {
    title: 'Stairway to Heaven',
    author: 'Led Zeppelin',
    level: 'advanced',
    key: 'Am',
    ultimate_guitar_link:
      'https://tabs.ultimate-guitar.com/tab/led-zeppelin/stairway-to-heaven-chords-19512',
  },
  {
    title: 'Blackbird',
    author: 'The Beatles',
    level: 'intermediate',
    key: 'G',
    ultimate_guitar_link: 'https://tabs.ultimate-guitar.com/tab/the-beatles/blackbird-chords-19542',
  },
  {
    title: 'Let It Be',
    author: 'The Beatles',
    level: 'beginner',
    key: 'C',
    ultimate_guitar_link: 'https://tabs.ultimate-guitar.com/tab/the-beatles/let-it-be-chords-19540',
  },
  {
    title: 'Smoke on the Water',
    author: 'Deep Purple',
    level: 'beginner',
    key: 'E',
    ultimate_guitar_link:
      'https://tabs.ultimate-guitar.com/tab/deep-purple/smoke-on-the-water-tabs-17765',
  },
  {
    title: 'Nothing Else Matters',
    author: 'Metallica',
    level: 'intermediate',
    key: 'Em',
    ultimate_guitar_link:
      'https://tabs.ultimate-guitar.com/tab/metallica/nothing-else-matters-chords-49291',
  },
  {
    title: 'Tears in Heaven',
    author: 'Eric Clapton',
    level: 'intermediate',
    key: 'A',
    ultimate_guitar_link:
      'https://tabs.ultimate-guitar.com/tab/eric-clapton/tears-in-heaven-chords-19421',
  },
  {
    title: 'Sweet Child O Mine',
    author: 'Guns N Roses',
    level: 'advanced',
    key: 'D',
    ultimate_guitar_link:
      'https://tabs.ultimate-guitar.com/tab/guns-n-roses/sweet-child-o-mine-chords-19623',
  },
  {
    title: 'Wish You Were Here',
    author: 'Pink Floyd',
    level: 'intermediate',
    key: 'G',
    ultimate_guitar_link:
      'https://tabs.ultimate-guitar.com/tab/pink-floyd/wish-you-were-here-chords-19741',
  },
  {
    title: 'Knockin on Heavens Door',
    author: 'Bob Dylan',
    level: 'beginner',
    key: 'G',
    ultimate_guitar_link:
      'https://tabs.ultimate-guitar.com/tab/bob-dylan/knockin-on-heavens-door-chords-19268',
  },
  {
    title: 'Crazy Little Thing Called Love',
    author: 'Queen',
    level: 'beginner',
    key: 'D',
    ultimate_guitar_link:
      'https://tabs.ultimate-guitar.com/tab/queen/crazy-little-thing-called-love-chords-19785',
  },
  {
    title: 'Under the Bridge',
    author: 'Red Hot Chili Peppers',
    level: 'intermediate',
    key: 'E',
    ultimate_guitar_link:
      'https://tabs.ultimate-guitar.com/tab/red-hot-chili-peppers/under-the-bridge-chords-19804',
  },
  {
    title: 'Come As You Are',
    author: 'Nirvana',
    level: 'beginner',
    key: 'Em',
    ultimate_guitar_link:
      'https://tabs.ultimate-guitar.com/tab/nirvana/come-as-you-are-chords-19732',
  },
  {
    title: 'The Scientist',
    author: 'Coldplay',
    level: 'beginner',
    key: 'Dm',
    ultimate_guitar_link:
      'https://tabs.ultimate-guitar.com/tab/coldplay/the-scientist-chords-19305',
  },
];

async function seedRemoteDatabase() {
  console.log('🚀 Starting remote database seed...\n');
  console.log(`📡 Target: ${SUPABASE_URL}\n`);

  try {
    // Step 1: Delete existing data
    console.log('🗑️  Step 1: Cleaning existing data...');

    // Delete in correct order (respecting foreign keys)
    await supabase.from('lesson_songs').delete().neq('id', '00000000-0000-0000-0000-000000000000');
    await supabase.from('assignments').delete().neq('id', '00000000-0000-0000-0000-000000000000');
    await supabase.from('lessons').delete().neq('id', '00000000-0000-0000-0000-000000000000');
    await supabase.from('songs').delete().neq('id', '00000000-0000-0000-0000-000000000000');
    await supabase.from('profiles').delete().neq('id', '00000000-0000-0000-0000-000000000000');

    console.log('   ✅ Deleted existing data from tables\n');

    // Step 2: Delete all auth users
    console.log('🗑️  Step 2: Deleting existing auth users...');

    const { data: existingUsers } = await supabase.auth.admin.listUsers();

    if (existingUsers?.users && existingUsers.users.length > 0) {
      for (const user of existingUsers.users) {
        await supabase.auth.admin.deleteUser(user.id);
        console.log(`   🗑️  Deleted user: ${user.email}`);
      }
    }

    console.log('   ✅ Cleaned all existing users\n');

    // Step 3: Create new users with correct credentials
    console.log('👥 Step 3: Creating development users...');

    for (const user of DEV_USERS) {
      const { data: authData, error: authError } = await supabase.auth.admin.createUser({
        email: user.email,
        password: user.password,
        email_confirm: true,
        user_metadata: {
          full_name: user.full_name,
        },
      });

      if (authError) {
        console.error(`   ❌ Failed to create user ${user.email}:`, authError.message);
        continue;
      }

      console.log(`   ✅ Created auth user: ${user.email}`);

      // Create profile
      const { error: profileError } = await supabase.from('profiles').upsert({
        id: authData.user!.id,
        email: user.email,
        full_name: user.full_name,
        is_admin: user.is_admin,
        is_teacher: user.is_teacher,
        is_student: user.is_student,
        is_development: true,
      });

      if (profileError) {
        console.error(`   ❌ Failed to create profile for ${user.email}:`, profileError.message);
      }
    }

    console.log('   ✅ Created all user profiles\n');

    // Step 4: Verify user creation
    console.log('🔍 Step 4: Verifying users...');

    const { data: profiles, error: profilesError } = await supabase
      .from('profiles')
      .select('email, full_name, is_admin, is_teacher, is_student')
      .order('created_at', { ascending: false });

    if (profilesError) {
      console.error('   ❌ Error fetching profiles:', profilesError.message);
    } else {
      console.log(`   ✅ Created ${profiles?.length || 0} profiles:`);
      profiles?.forEach((p) => {
        const roles = [];
        if (p.is_admin) roles.push('Admin');
        if (p.is_teacher) roles.push('Teacher');
        if (p.is_student) roles.push('Student');
        console.log(`      - ${p.email} (${p.full_name}) - ${roles.join(', ')}`);
      });
    }

    console.log('');

    // Step 5: Seed songs
    console.log('🎵 Step 5: Seeding songs...');

    const { data: songs, error: songsError } = await supabase
      .from('songs')
      .insert(SAMPLE_SONGS)
      .select();

    if (songsError) {
      console.error('   ❌ Error seeding songs:', songsError.message);
    } else {
      console.log(`   ✅ Seeded ${songs?.length || 0} songs`);

      // Show summary by difficulty
      const levels = { beginner: 0, intermediate: 0, advanced: 0 };
      songs?.forEach((song) => {
        if (song.level in levels) {
          levels[song.level as keyof typeof levels]++;
        }
      });

      console.log('   📊 Songs by difficulty:');
      console.log(`      Beginner: ${levels.beginner}`);
      console.log(`      Intermediate: ${levels.intermediate}`);
      console.log(`      Advanced: ${levels.advanced}`);
    }

    console.log('\n✅ Remote database seeding completed successfully!\n');
    console.log('🔑 Development credentials:');
    console.log('   Admin: p.romanczuk@gmail.com / test123_admin');
    console.log('   Teacher: teacher@example.com / test123_teacher');
    console.log('   Student: student@example.com / test123_student');
    console.log('   Students: teststudent1-3@example.com / test123_student');
  } catch (err) {
    console.error('\n❌ Unexpected error during seeding:', err);
    process.exit(1);
  }
}

seedRemoteDatabase();
