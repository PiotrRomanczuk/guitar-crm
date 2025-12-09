import { createClient } from '@supabase/supabase-js';
import dotenv from 'dotenv';

dotenv.config({ path: '.env.local' });

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

if (!supabaseUrl || !supabaseServiceKey) {
  console.error('Missing Supabase credentials');
  process.exit(1);
}

const supabase = createClient(supabaseUrl, supabaseServiceKey);

async function checkUserRoles() {
  const email = 'student@example.com';

  // Get user ID
  const {
    data: { users },
    error: userError,
  } = await supabase.auth.admin.listUsers();

  if (userError) {
    console.error('Error listing users:', userError);
    return;
  }

  const user = users.find((u) => u.email === email);

  if (!user) {
    console.log(`User ${email} not found in Auth.`);
    return;
  }

  console.log(`User found: ${user.id}`);

  // Get roles
  const { data: roles, error: rolesError } = await supabase
    .from('user_roles')
    .select('*')
    .eq('user_id', user.id);

  if (rolesError) {
    console.error('Error fetching roles:', rolesError);
    return;
  }

  console.log('Roles:', roles);
}

checkUserRoles();
