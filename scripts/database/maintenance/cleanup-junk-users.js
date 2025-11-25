const { createClient } = require('@supabase/supabase-js');
const path = require('path');
require('dotenv').config({ path: path.resolve(process.cwd(), '.env.local') });

const SUPABASE_URL = process.env.NEXT_PUBLIC_SUPABASE_URL || process.env.SUPABASE_URL;
const SERVICE_ROLE_KEY =
  process.env.SUPABASE_SERVICE_ROLE_KEY || process.env.NEXT_PUBLIC_SUPABASE_SERVICE_ROLE_KEY;

if (!SUPABASE_URL || !SERVICE_ROLE_KEY) {
  console.error(
    'Missing Supabase env. Ensure NEXT_PUBLIC_SUPABASE_URL and SUPABASE_SERVICE_ROLE_KEY are set.'
  );
  process.exit(1);
}

const supabase = createClient(SUPABASE_URL, SERVICE_ROLE_KEY, {
  auth: {
    autoRefreshToken: false,
    persistSession: false,
  },
});

const KEEP_EMAILS = [
  'p.romanczuk@gmail.com',
  'teacher@example.com',
  'student@example.com',
  'teststudent1@example.com',
  'teststudent2@example.com',
  'teststudent3@example.com',
];

async function cleanupUsers() {
  console.log('Starting user cleanup...');
  console.log('Keeping users:', KEEP_EMAILS.join(', '));

  try {
    // 1. List all users
    const {
      data: { users },
      error: listError,
    } = await supabase.auth.admin.listUsers({
      perPage: 1000,
    });

    if (listError) throw listError;

    console.log(`Found ${users.length} total users.`);

    // 2. Identify users to delete
    const usersToDelete = users.filter((u) => !KEEP_EMAILS.includes(u.email));

    if (usersToDelete.length === 0) {
      console.log('No junk users found. Database is clean.');
      return;
    }

    console.log(`Found ${usersToDelete.length} users to delete.`);

    // 3. Delete users
    for (const user of usersToDelete) {
      console.log(`Deleting user: ${user.email} (${user.id})...`);
      const { error: deleteError } = await supabase.auth.admin.deleteUser(user.id);

      if (deleteError) {
        console.error(`Failed to delete user ${user.email}:`, deleteError.message);
      } else {
        console.log(`Deleted ${user.email}`);
      }
    }

    console.log('Cleanup complete.');
  } catch (err) {
    console.error('Error during cleanup:', err);
    process.exit(1);
  }
}

cleanupUsers();
