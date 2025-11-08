// Test script to verify admin can fetch data with proper RLS policies
const fetch = require('node-fetch');
const path = require('path');
require('dotenv').config({ path: path.resolve(process.cwd(), '.env.local') });

const SUPABASE_URL = process.env.NEXT_PUBLIC_SUPABASE_URL;
const SUPABASE_ANON_KEY = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

async function login(email, password) {
  const url = `${SUPABASE_URL}/auth/v1/token?grant_type=password`;

  const res = await fetch(url, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      apikey: SUPABASE_ANON_KEY,
    },
    body: JSON.stringify({ email, password }),
  });

  const data = await res.json();
  if (!res.ok) {
    throw new Error(`Login failed: ${data.msg}`);
  }

  return data.access_token;
}

async function fetchData(accessToken, table) {
  const url = `${SUPABASE_URL}/rest/v1/${table}?select=*`;

  const res = await fetch(url, {
    method: 'GET',
    headers: {
      apikey: SUPABASE_ANON_KEY,
      Authorization: `Bearer ${accessToken}`,
    },
  });

  const data = await res.json();
  if (!res.ok) {
    console.error(`❌ Failed to fetch ${table}:`, data);
    return [];
  }

  return data;
}

(async () => {
  console.log('🧪 Testing Admin Data Access\n');
  console.log('='.repeat(50));

  try {
    // Login as admin
    console.log('\n1️⃣  Logging in as admin (p.romanczuk@gmail.com)...');
    const accessToken = await login('p.romanczuk@gmail.com', 'test123_admin');
    console.log('✅ Login successful\n');

    // Test fetching songs
    console.log('2️⃣  Fetching songs...');
    const songs = await fetchData(accessToken, 'songs');
    console.log(`   📊 Result: ${songs.length} songs found`);
    if (songs.length > 0) {
      console.log(`   ✅ SUCCESS: Can fetch songs (${songs.length} records)`);
      console.log(`   📝 Sample: "${songs[0].title}" by ${songs[0].author}`);
    } else {
      console.log('   ❌ FAIL: No songs returned (RLS policy issue?)');
    }

    // Test fetching lessons
    console.log('\n3️⃣  Fetching lessons...');
    const lessons = await fetchData(accessToken, 'lessons');
    console.log(`   📊 Result: ${lessons.length} lessons found`);
    if (lessons.length > 0) {
      console.log(`   ✅ SUCCESS: Can fetch lessons (${lessons.length} records)`);
    } else {
      console.log('   ❌ FAIL: No lessons returned (RLS policy issue?)');
    }

    // Test fetching profiles (users)
    console.log('\n4️⃣  Fetching profiles (users)...');
    const profiles = await fetchData(accessToken, 'profiles');
    console.log(`   📊 Result: ${profiles.length} profiles found`);
    if (profiles.length > 0) {
      console.log(`   ✅ SUCCESS: Can fetch profiles (${profiles.length} records)`);
      console.log(`   📝 Sample: ${profiles[0].full_name} (${profiles[0].email})`);
    } else {
      console.log('   ❌ FAIL: No profiles returned (RLS policy issue?)');
    }

    // Summary
    console.log('\n' + '='.repeat(50));
    console.log('📋 SUMMARY:');
    console.log(`   Songs: ${songs.length > 0 ? '✅ PASS' : '❌ FAIL'} (${songs.length} records)`);
    console.log(
      `   Lessons: ${lessons.length > 0 ? '✅ PASS' : '❌ FAIL'} (${lessons.length} records)`
    );
    console.log(
      `   Profiles: ${profiles.length > 0 ? '✅ PASS' : '❌ FAIL'} (${profiles.length} records)`
    );

    const allPassed = songs.length > 0 && lessons.length > 0 && profiles.length > 0;
    if (allPassed) {
      console.log('\n🎉 ALL TESTS PASSED! Admin can access all data.');
    } else {
      console.log('\n⚠️  SOME TESTS FAILED! Check RLS policies.');
    }
  } catch (error) {
    console.error('\n❌ ERROR:', error.message);
    process.exit(1);
  }
})();
