import { createClient } from '@supabase/supabase-js';
import dotenv from 'dotenv';
import path from 'path';
import { fileURLToPath } from 'url';
import { dirname } from 'path';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

// Load environment variables from .env.local
dotenv.config({ path: path.resolve(__dirname, '../../.env.local') });

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

if (!supabaseUrl || !supabaseServiceKey) {
  console.error('Error: NEXT_PUBLIC_SUPABASE_URL and SUPABASE_SERVICE_ROLE_KEY must be set in .env.local');
  process.exit(1);
}

const supabase = createClient(supabaseUrl, supabaseServiceKey);

async function testShadowUserLinking() {
  console.log('Starting Shadow User Linking Test...');

  // 1. Create a "Shadow User" (Profile without Auth User)
  const shadowUserId = crypto.randomUUID();
  const shadowEmail = `shadow-test-${Date.now()}@example.com`;

  console.log(`Creating Shadow User Profile with ID: ${shadowUserId}`);

  const { error: createProfileError } = await supabase
    .from('profiles')
    .insert({
      id: shadowUserId,
      email: shadowEmail,
      full_name: 'Shadow User Test',
      is_student: true,
    });

  if (createProfileError) {
    console.error('Error creating shadow profile:', createProfileError);
    return;
  }

  console.log('Shadow User Profile created.');

  // 2. Create dependent data (e.g., a Lesson) linked to this Shadow User
  console.log('Creating a Lesson linked to the Shadow User...');
  
  const teacherId = crypto.randomUUID();
  await supabase.from('profiles').insert({
      id: teacherId,
      email: `teacher-test-${Date.now()}@example.com`,
      full_name: 'Test Teacher',
      is_teacher: true
  });

  const { data: lessonData, error: createLessonError } = await supabase
    .from('lessons')
    .insert({
      student_id: shadowUserId,
      teacher_id: teacherId,
      scheduled_at: new Date().toISOString(),
      lesson_teacher_number: 1,
      status: 'SCHEDULED'
    })
    .select()
    .single();

  if (createLessonError) {
    console.error('Error creating lesson:', createLessonError);
    // Cleanup
    await supabase.from('profiles').delete().eq('id', shadowUserId);
    await supabase.from('profiles').delete().eq('id', teacherId);
    return;
  }

  console.log(`Lesson created with ID: ${lessonData.id} linked to Student ID: ${shadowUserId}`);

  // 3. Simulate "Claiming" the account by UPDATING the Profile ID
  console.log('Simulating User Linking by UPDATING the Profile ID...');
  
  const newRealUserId = crypto.randomUUID();
  console.log(`New Real User ID will be: ${newRealUserId}`);

  // Perform the UPDATE on the profiles table
  const { error: updateError } = await supabase
    .from('profiles')
    .update({ id: newRealUserId })
    .eq('id', shadowUserId);

  if (updateError) {
    console.error('Error updating profile ID:', updateError);
    // Cleanup
    await supabase.from('lessons').delete().eq('id', lessonData.id);
    await supabase.from('profiles').delete().eq('id', shadowUserId);
    await supabase.from('profiles').delete().eq('id', teacherId);
    return;
  }

  console.log('Profile ID updated successfully.');

  // 4. Verify the Lesson now points to the new ID
  console.log('Verifying Lesson linkage...');

  const { data: updatedLesson, error: fetchLessonError } = await supabase
    .from('lessons')
    .select('*')
    .eq('id', lessonData.id)
    .single();

  if (fetchLessonError) {
    console.error('Error fetching updated lesson:', fetchLessonError);
  } else {
    if (updatedLesson.student_id === newRealUserId) {
      console.log('SUCCESS: Lesson student_id was automatically updated to the new User ID!');
    } else {
      console.error(`FAILURE: Lesson student_id is ${updatedLesson.student_id}, expected ${newRealUserId}`);
    }
  }

  // 5. Cleanup
  console.log('Cleaning up test data...');
  await supabase.from('lessons').delete().eq('id', lessonData.id);
  await supabase.from('profiles').delete().eq('id', newRealUserId); // Delete the new ID
  await supabase.from('profiles').delete().eq('id', teacherId);
  
  console.log('Test Complete.');
}

testShadowUserLinking();
