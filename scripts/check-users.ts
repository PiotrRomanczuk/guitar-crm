import { createClient } from '@supabase/supabase-js';

const SUPABASE_URL = 'http://127.0.0.1:54321';
const serviceRoleKey =
  'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZS1kZW1vIiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImV4cCI6MTk4MzgxMjk5Nn0.EGIM96RAZx35lJzdJsyH-qQwv8Hdp7fsn3W0YpN81IU';

const supabase = createClient(SUPABASE_URL, serviceRoleKey);

async function main() {
  console.log('Checking connection...');
  const { data, error } = await supabase.auth.admin.listUsers();

  if (error) {
    console.error('Error listing users:', error);
  } else {
    console.log('Users found:', data.users.length);
    data.users.forEach((u) => console.log(`- ${u.email}`));
  }
}

main();
