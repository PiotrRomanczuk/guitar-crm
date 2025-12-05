import { createClient } from '@supabase/supabase-js';

const supabaseUrl = 'http://127.0.0.1:54321';
const serviceRoleKey =
  'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6IlN0dWRlbnRNYW5hZ2VyIiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTcwODc2NDgwMCwiZXhwIjoyMDI0MzQwODAwfQ.cxX5-8W5y5L5y5L5y5L5y5L5y5L5y5L5y5L5y5L5y5L';

const supabase = createClient(supabaseUrl, serviceRoleKey, {
  auth: {
    autoRefreshToken: false,
    persistSession: false,
  },
});

async function main() {
  console.log('Attempting to create a test user...');

  const email = `test-${Date.now()}@example.com`;
  const password = 'password123';

  const { data, error } = await supabase.auth.admin.createUser({
    email,
    password,
    email_confirm: true,
  });

  if (error) {
    console.error('Error creating user:', error);
  } else {
    console.log('User created successfully:', data.user.id);
  }
}

main();
