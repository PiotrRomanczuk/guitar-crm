// Script to create temporary users via API and extract their password hashes
// This generates real bcrypt hashes that can be used in seed_profiles.sql
// Usage: node extract-password-hashes.js

const fetch = require('node-fetch');
const path = require('path');
require('dotenv').config({ path: path.resolve(process.cwd(), '.env.local') });

const SUPABASE_URL = process.env.NEXT_PUBLIC_SUPABASE_URL;
const SERVICE_ROLE_KEY = process.env.NEXT_PUBLIC_SUPABASE_SERVICE_ROLE_KEY;

if (!SUPABASE_URL || !SERVICE_ROLE_KEY) {
  console.error('Missing Supabase env variables.');
  process.exit(1);
}

// Users with their real passwords from development_credentials.txt
const devUsers = [
  {
    email: 'temp_admin@example.com',
    password: 'test123_admin',
    originalEmail: 'p.romanczuk@gmail.com',
  },
  {
    email: 'temp_teacher@example.com',
    password: 'test123_teacher',
    originalEmail: 'teacher@example.com',
  },
  {
    email: 'temp_student@example.com',
    password: 'test123_student',
    originalEmail: 'student@example.com',
  },
  {
    email: 'temp_student1@example.com',
    password: 'test123_student',
    originalEmail: 'teststudent1@example.com',
  },
  {
    email: 'temp_student2@example.com',
    password: 'test123_student',
    originalEmail: 'teststudent2@example.com',
  },
  {
    email: 'temp_student3@example.com',
    password: 'test123_student',
    originalEmail: 'teststudent3@example.com',
  },
];

async function createTempUser(user) {
  const url = `${SUPABASE_URL}/auth/v1/admin/users`;
  const body = {
    email: user.email,
    password: user.password,
    email_confirm: true,
  };

  const res = await fetch(url, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      Authorization: `Bearer ${SERVICE_ROLE_KEY}`,
      apikey: SERVICE_ROLE_KEY,
    },
    body: JSON.stringify(body),
  });

  const data = await res.json();
  if (!res.ok) {
    console.error(`Failed to create temp user ${user.email}:`, data);
    return null;
  }
  return data.id;
}

async function getUserHash(userId) {
  // Using direct database query via Supabase REST API
  const url = `${SUPABASE_URL}/rest/v1/rpc/get_user_hash`;

  // Since we can't directly query auth.users via REST API, we'll use psql
  return null; // We'll use psql in the main function
}

async function deleteTempUser(userId) {
  const url = `${SUPABASE_URL}/auth/v1/admin/users/${userId}`;

  const res = await fetch(url, {
    method: 'DELETE',
    headers: {
      Authorization: `Bearer ${SERVICE_ROLE_KEY}`,
      apikey: SERVICE_ROLE_KEY,
    },
  });

  return res.ok;
}

(async () => {
  console.log('Creating temporary users to extract password hashes...\n');

  const createdUsers = [];

  for (const user of devUsers) {
    console.log(`Creating temp user: ${user.email}...`);
    const userId = await createTempUser(user);
    if (userId) {
      createdUsers.push({ ...user, id: userId });
      console.log(`✅ Created with ID: ${userId}`);
    }
    await new Promise((r) => setTimeout(r, 100));
  }

  console.log('\n📋 Now run this psql command to get the hashes:\n');
  console.log(
    `psql postgresql://postgres:postgres@localhost:54322/postgres -c "SELECT email, encrypted_password FROM auth.users WHERE email LIKE 'temp_%@example.com' ORDER BY email;"`
  );

  console.log('\n⚠️  After copying the hashes, run this to clean up:\n');
  console.log('node scripts/database/cleanup-temp-users.js');

  // Save the user IDs for cleanup
  const fs = require('fs');
  fs.writeFileSync('temp_user_ids.json', JSON.stringify(createdUsers, null, 2));
  console.log('\n💾 Temp user IDs saved to temp_user_ids.json');
})();
