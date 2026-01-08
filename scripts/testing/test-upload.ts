
import { createClient } from '@supabase/supabase-js';
import dotenv from 'dotenv';

dotenv.config({ path: '.env.local' });

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const anonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;
const serviceRoleKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

if (!supabaseUrl || !anonKey || !serviceRoleKey) {
  console.error('Missing environment variables');
  process.exit(1);
}

// Client for admin operations (creating user)
const adminClient = createClient(supabaseUrl, serviceRoleKey);
// Client for testing upload (as authenticated user)
const authClient = createClient(supabaseUrl, anonKey);

async function testUpload() {
  const testEmail = `test-upload-${Date.now()}@example.com`;
  const testPassword = 'password123';
  let userId = '';

  try {
    console.log('1. Creating test user...');
    const { data: userData, error: createError } = await adminClient.auth.admin.createUser({
      email: testEmail,
      password: testPassword,
      email_confirm: true
    });

    if (createError) throw createError;
    userId = userData.user.id;
    console.log('✅ Test user created:', userId);

    console.log('2. Signing in...');
    const { error: signInError } = await authClient.auth.signInWithPassword({
      email: testEmail,
      password: testPassword
    });

    if (signInError) throw signInError;
    console.log('✅ Signed in successfully');

    console.log('3. Uploading image...');
    const fileName = `test-${Date.now()}.png`;
    const fileBody = Buffer.from('iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAYAAAAfFcSJAAAADUlEQVR42mP8z8BQDwAEhQGAhKmMIQAAAABJRU5ErkJggg==', 'base64');

    const { data, error: uploadError } = await authClient.storage
      .from('song-images')
      .upload(fileName, fileBody, {
        contentType: 'image/png'
      });

    if (uploadError) throw uploadError;
    console.log('✅ Upload successful:', data);

    console.log('4. Verifying public URL...');
    const { data: urlData } = authClient.storage
      .from('song-images')
      .getPublicUrl(fileName);
    console.log('✅ Public URL generated:', urlData.publicUrl);

    // Clean up file
    await authClient.storage.from('song-images').remove([fileName]);
    console.log('✅ Test file cleaned up');

  } catch (error) {
    console.error('❌ Test failed:', error);
  } finally {
    // Clean up user
    if (userId) {
      console.log('5. Cleaning up test user...');
      await adminClient.auth.admin.deleteUser(userId);
      console.log('✅ Test user deleted');
    }
  }
}

testUpload();
