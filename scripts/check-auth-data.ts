import { createAdminClient } from '@/lib/supabase/admin';

async function checkUserAuthData() {
  const supabaseAdmin = createAdminClient();
  
  // List a few users to inspect their auth data structure
  const { data: { users }, error } = await supabaseAdmin.auth.admin.listUsers({
    page: 1,
    perPage: 50 // Increase to find a real user
  });

  if (error) {
    console.error('Error listing users:', error);
    return;
  }

  console.log('Found users:', users.length);
  
  users.forEach(user => {
    console.log('------------------------------------------------');
    console.log(`User: ${user.email}`);
    console.log(`ID: ${user.id}`);
    console.log(`Confirmed At: ${user.email_confirmed_at}`);
    console.log(`Last Sign In: ${user.last_sign_in_at}`);
    console.log(`App Metadata:`, user.app_metadata);
    console.log(`User Metadata:`, user.user_metadata);
    console.log(`Identities:`, user.identities?.map(i => ({ provider: i.provider, id: i.id })));
    // Check if encrypted_password exists (it might not be exposed even to admin in some versions/configs)
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    console.log(`Encrypted Password Present:`, !!(user as any).encrypted_password);
  });
}

checkUserAuthData();
