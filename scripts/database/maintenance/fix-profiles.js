const { createClient } = require('@supabase/supabase-js');
const path = require('path');
require('dotenv').config({ path: path.resolve(process.cwd(), '.env.local') });

const SUPABASE_URL = process.env.NEXT_PUBLIC_SUPABASE_URL;
const SUPABASE_SERVICE_ROLE_KEY = process.env.SUPABASE_SERVICE_ROLE_KEY;

if (!SUPABASE_URL || !SUPABASE_SERVICE_ROLE_KEY) {
  console.error('❌ Missing Supabase environment variables');
  process.exit(1);
}

const supabase = createClient(SUPABASE_URL, SUPABASE_SERVICE_ROLE_KEY);

async function fixProfiles() {
  console.log('Cleaning up mismatched profiles...');

  // Delete all profiles (cascading might be an issue, but let's try)
  // Actually, better to delete specific profiles by email if they exist
  const emails = [
    'p.romanczuk@gmail.com',
    'teacher@example.com',
    'student@example.com',
    'teststudent1@example.com',
    'teststudent2@example.com',
    'teststudent3@example.com',
  ];

  const { error } = await supabase.from('profiles').delete().in('email', emails);

  if (error) {
    console.error('❌ Failed to delete profiles:', error.message);
  } else {
    console.log('✅ Deleted existing profiles for dev users.');
  }
}

fixProfiles();
