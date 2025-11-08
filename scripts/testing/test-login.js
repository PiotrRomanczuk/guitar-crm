// Quick test script to verify login credentials
const fetch = require('node-fetch');
const path = require('path');
require('dotenv').config({ path: path.resolve(process.cwd(), '.env.local') });

const SUPABASE_URL = process.env.NEXT_PUBLIC_SUPABASE_URL;
const SUPABASE_ANON_KEY = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

async function testLogin(email, password) {
  const url = `${SUPABASE_URL}/auth/v1/token?grant_type=password`;

  const res = await fetch(url, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      apikey: SUPABASE_ANON_KEY,
    },
    body: JSON.stringify({
      email,
      password,
    }),
  });

  const data = await res.json();

  if (!res.ok) {
    console.error(`❌ Login failed for ${email}:`, data);
    return false;
  }

  console.log(`✅ Login successful for ${email}`);
  console.log(`   User ID: ${data.user.id}`);
  return true;
}

(async () => {
  console.log('Testing login credentials...\n');

  await testLogin('p.romanczuk@gmail.com', 'test123_admin');
  await testLogin('teacher@example.com', 'test123_teacher');
  await testLogin('student@example.com', 'test123_student');
})();
