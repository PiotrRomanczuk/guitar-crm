
import { config } from 'dotenv';
import { join } from 'path';
import { createClient } from '@supabase/supabase-js';

// Load environment variables
config({ path: join(process.cwd(), '.env.local') });

const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
const key = process.env.SUPABASE_SERVICE_ROLE_KEY;

if (!url || !key) {
  console.error('❌ Missing Supabase credentials');
  process.exit(1);
}

const supabase = createClient(url, key);

async function main() {
  console.log('🌱 Seeding Test Data for E2E...');

  // 1. Get Student
  const { data: students, error: studentError } = await supabase
    .from('profiles')
    .select('id, email')
    .eq('email', 'student@example.com')
    .single();

  if (studentError || !students) {
    console.error('❌ Student not found:', studentError);
    return;
  }
  const studentId = students.id;
  console.log(`✅ Found Student: ${studentId}`);

  // 2. Get Teacher
  const { data: teachers, error: teacherError } = await supabase
    .from('profiles')
    .select('id, email')
    .eq('email', 'teacher@example.com')
    .single();

  if (teacherError || !teachers) {
      // Fallback to any teacher or admin
    console.log('Teacher not found, trying admin...');
  }
  const teacherId = teachers?.id || (await supabase.from('profiles').select('id').eq('email', 'p.romanczuk@gmail.com').single()).data?.id;

  if (!teacherId) {
      console.error('❌ No teacher found');
      return;
  }
  console.log(`✅ Found Teacher: ${teacherId}`);

  // 3. Get a Song
  const { data: songs, error: songError } = await supabase
    .from('songs')
    .select('id, title')
    .limit(1)
    .single();

  if (songError || !songs) {
    console.error('❌ No songs found in DB. Please seed songs first.');
    return;
  }
  console.log(`✅ Found Song: ${songs.title} (${songs.id})`);

  // 4. Create Lesson
  console.log('Creating Lesson...');
  const { data: lesson, error: lessonError } = await supabase
    .from('lessons')
    .insert({
      student_id: studentId,
      teacher_id: teacherId,
      scheduled_at: new Date().toISOString(),
      status: 'SCHEDULED',
      lesson_teacher_number: 1,
      title: 'E2E Test Lesson'
    })
    .select()
    .single();

  if (lessonError) {
    console.error('❌ Failed to create lesson:', lessonError);
    return;
  }
  console.log(`✅ Created Lesson: ${lesson.id}`);

  // 5. Assign Song to Lesson
  console.log('Assigning Song...');
  const { error: assignError } = await supabase
    .from('lesson_songs')
    .insert({
      lesson_id: lesson.id,
      song_id: songs.id,
      status: 'to_learn',
      notes: 'For E2E test'
    });

  if (assignError) {
    console.error('❌ Failed to assign song:', assignError);
    return;
  }

  console.log(`✅ Assigned song '${songs.title}' to student.`);
}

main().catch(console.error);
