// Node.js script to update development user passwords via Supabase Auth REST API
// Usage: node update-dev-passwords-via-api.js

const fetch = require('node-fetch');
const fs = require('fs');
const path = require('path');
require('dotenv').config({ path: path.resolve(process.cwd(), '.env.local') });

const SUPABASE_URL = process.env.NEXT_PUBLIC_SUPABASE_URL;
const SERVICE_ROLE_KEY = process.env.NEXT_PUBLIC_SUPABASE_SERVICE_ROLE_KEY;

if (!SUPABASE_URL || !SERVICE_ROLE_KEY) {
  console.error(
    'Missing Supabase env. Ensure NEXT_PUBLIC_SUPABASE_URL and NEXT_PUBLIC_SUPABASE_SERVICE_ROLE_KEY are set.'
  );
  process.exit(1);
}

const devUsers = [
  {
    id: 'f7f3bc3f-72e4-4704-8d6d-0646ab4f0427',
    email: 'p.romanczuk@gmail.com',
    password: 'test123_admin',
  },
  {
    id: 'cb755725-11e8-4428-9a16-5e479ed4f90d',
    email: 'teacher@example.com',
    password: 'test123_teacher',
  },
  {
    id: 'fda1b453-5874-42a6-8675-42f2c58b692d',
    email: 'student@example.com',
    password: 'test123_student',
  },
  {
    id: '786a8a4e-92aa-49de-8635-ea0b732eb359',
    email: 'teststudent1@example.com',
    password: 'test123_student',
  },
  {
    id: '7c40f9e1-41d8-4bab-a1b6-f4fd46a3089b',
    email: 'teststudent2@example.com',
    password: 'test123_student',
  },
  {
    id: 'fb1670f6-0825-47ee-bc5d-8945a4e178b9',
    email: 'teststudent3@example.com',
    password: 'test123_student',
  },
];

async function updateUserPassword(user) {
  const url = `${SUPABASE_URL}/auth/v1/admin/users/${user.id}`;
  const body = {
    password: user.password,
  };

  const res = await fetch(url, {
    method: 'PUT',
    headers: {
      'Content-Type': 'application/json',
      Authorization: `Bearer ${SERVICE_ROLE_KEY}`,
      apikey: SERVICE_ROLE_KEY,
    },
    body: JSON.stringify(body),
  });

  const data = await res.json();
  if (!res.ok) {
    console.error(
      `Failed to update password for ${user.email}:`,
      data.error ? data.error.message : data
    );
    return false;
  }
  console.log(`✅ Updated password for: ${user.email}`);
  return true;
}

(async () => {
  let successCount = 0;
  for (const user of devUsers) {
    const success = await updateUserPassword(user);
    if (success) successCount++;
    // Small delay to avoid rate limits
    await new Promise((r) => setTimeout(r, 100));
  }
  console.log(`\n✨ Updated passwords for ${successCount}/${devUsers.length} development users`);
})();
