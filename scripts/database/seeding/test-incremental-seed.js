#!/usr/bin/env node

const fs = require('fs');
const path = require('path');
const { createClient } = require('@supabase/supabase-js');

const supabaseUrl = process.env.SUPABASE_URL || 'http://127.0.0.1:54321';
const supabaseKey =
  process.env.SUPABASE_SERVICE_ROLE_KEY ||
  'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZS1kZW1vIiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImV4cCI6MTk4MzgxMjk5Nn0.EGIM96RAZx35lJzdJsyH-qQwv8Hdp7fsn3W0YpN81IU';

const supabase = createClient(supabaseUrl, supabaseKey);
const dataDir = path.join(__dirname, 'data');

console.log('🔍 Incremental Seeding Test\n');

async function testStep(stepName, fn) {
  console.log(`\n${'='.repeat(60)}`);
  console.log(`📍 ${stepName}`);
  console.log('='.repeat(60));
  try {
    await fn();
    console.log(`✅ ${stepName} - SUCCESS`);
  } catch (error) {
    console.log(`❌ ${stepName} - FAILED`);
    console.error(`   Error: ${error.message}`);
    if (error.details) console.error(`   Details: ${error.details}`);
    throw error; // Stop on first failure
  }
}

async function main() {
  // Step 1: Verify lessons exist
  await testStep('Step 1: Verify lessons exist in database', async () => {
    const { data, error } = await supabase.from('lessons').select('id, title').order('title');
    if (error) throw error;
    console.log(`   Found ${data.length} lessons:`);
    data.forEach((lesson) => {
      console.log(`   - ${lesson.id.substring(0, 8)}... : ${lesson.title}`);
    });
  });

  // Step 2: Test single assignment insert
  await testStep('Step 2: Insert first assignment', async () => {
    const assignments = JSON.parse(fs.readFileSync(path.join(dataDir, 'assignments.json'), 'utf8'));
    const first = assignments[0];

    console.log(`   Inserting assignment: ${first.title}`);
    console.log(`   lesson_id: ${first.lesson_id}`);
    console.log(`   teacher_id: ${first.teacher_id}`);
    console.log(`   student_id: ${first.student_id}`);

    // First verify the lesson exists
    const { data: lesson, error: lessonError } = await supabase
      .from('lessons')
      .select('id, title')
      .eq('id', first.lesson_id)
      .single();

    if (lessonError) {
      console.log(`   ⚠️  Lesson lookup failed: ${lessonError.message}`);
    } else {
      console.log(`   ✓ Lesson found: ${lesson.title}`);
    }

    // Verify teacher exists
    const { data: teacher, error: teacherError } = await supabase
      .from('profiles')
      .select('id, display_name')
      .eq('id', first.teacher_id)
      .single();

    if (teacherError) {
      console.log(`   ⚠️  Teacher lookup failed: ${teacherError.message}`);
    } else {
      console.log(`   ✓ Teacher found: ${teacher.display_name || 'No name'}`);
    }

    // Verify student exists
    const { data: student, error: studentError } = await supabase
      .from('profiles')
      .select('id, display_name')
      .eq('id', first.student_id)
      .single();

    if (studentError) {
      console.log(`   ⚠️  Student lookup failed: ${studentError.message}`);
    } else {
      console.log(`   ✓ Student found: ${student.display_name || 'No name'}`);
    }

    // Now try to insert
    const { data, error } = await supabase.from('assignments').insert([first]).select();

    if (error) throw error;
    console.log(`   ✓ Assignment inserted successfully`);
  });

  // Step 3: Test all assignments one by one
  await testStep('Step 3: Insert remaining assignments one by one', async () => {
    const assignments = JSON.parse(fs.readFileSync(path.join(dataDir, 'assignments.json'), 'utf8'));

    for (let i = 1; i < assignments.length; i++) {
      const assignment = assignments[i];
      console.log(`   [${i}/${assignments.length - 1}] ${assignment.title}`);

      const { data, error } = await supabase.from('assignments').insert([assignment]).select();

      if (error) {
        console.log(`   ❌ Failed at assignment ${i}: ${assignment.title}`);
        console.log(`      lesson_id: ${assignment.lesson_id}`);
        throw error;
      }
    }
    console.log(`   ✓ All ${assignments.length - 1} remaining assignments inserted`);
  });

  // Step 4: Test lesson_songs
  await testStep('Step 4: Insert lesson_songs one by one', async () => {
    const lessonSongs = JSON.parse(
      fs.readFileSync(path.join(dataDir, 'lesson_songs.json'), 'utf8')
    );

    for (let i = 0; i < lessonSongs.length; i++) {
      const lessonSong = lessonSongs[i];
      console.log(
        `   [${i + 1}/${lessonSongs.length}] lesson_id: ${lessonSong.lesson_id.substring(0, 8)}...`
      );

      // Verify lesson exists
      const { data: lesson, error: lessonError } = await supabase
        .from('lessons')
        .select('id')
        .eq('id', lessonSong.lesson_id)
        .single();

      if (lessonError) {
        console.log(`   ❌ Lesson not found: ${lessonSong.lesson_id}`);
        throw new Error(`Lesson not found: ${lessonSong.lesson_id}`);
      }

      const { data, error } = await supabase.from('lesson_songs').insert([lessonSong]).select();

      if (error) {
        console.log(`   ❌ Failed at lesson_song ${i}`);
        throw error;
      }
    }
    console.log(`   ✓ All ${lessonSongs.length} lesson_songs inserted`);
  });

  // Step 5: Test lesson_history
  await testStep('Step 5: Insert lesson_history one by one', async () => {
    const lessonHistory = JSON.parse(
      fs.readFileSync(path.join(dataDir, 'lesson_history.json'), 'utf8')
    );

    for (let i = 0; i < lessonHistory.length; i++) {
      const history = lessonHistory[i];
      console.log(
        `   [${i + 1}/${lessonHistory.length}] ${
          history.change_type
        } - lesson_id: ${history.lesson_id.substring(0, 8)}...`
      );

      // Verify lesson exists
      const { data: lesson, error: lessonError } = await supabase
        .from('lessons')
        .select('id, title')
        .eq('id', history.lesson_id)
        .single();

      if (lessonError) {
        console.log(`   ❌ Lesson not found: ${history.lesson_id}`);
        throw new Error(`Lesson not found: ${history.lesson_id}`);
      } else {
        console.log(`      Lesson: ${lesson.title}`);
      }

      const { data, error } = await supabase.from('lesson_history').insert([history]).select();

      if (error) {
        console.log(`   ❌ Failed at lesson_history ${i}`);
        throw error;
      }
    }
    console.log(`   ✓ All ${lessonHistory.length} lesson_history records inserted`);
  });

  // Step 6: Test assignment_history
  await testStep('Step 6: Insert assignment_history one by one', async () => {
    const assignmentHistory = JSON.parse(
      fs.readFileSync(path.join(dataDir, 'assignment_history.json'), 'utf8')
    );

    for (let i = 0; i < assignmentHistory.length; i++) {
      const history = assignmentHistory[i];
      console.log(
        `   [${i + 1}/${assignmentHistory.length}] ${
          history.change_type
        } - assignment_id: ${history.assignment_id.substring(0, 8)}...`
      );

      // Verify assignment exists
      const { data: assignment, error: assignmentError } = await supabase
        .from('assignments')
        .select('id, title')
        .eq('id', history.assignment_id)
        .single();

      if (assignmentError) {
        console.log(`   ❌ Assignment not found: ${history.assignment_id}`);
        throw new Error(`Assignment not found: ${history.assignment_id}`);
      } else {
        console.log(`      Assignment: ${assignment.title}`);
      }

      const { data, error } = await supabase.from('assignment_history').insert([history]).select();

      if (error) {
        console.log(`   ❌ Failed at assignment_history ${i}`);
        throw error;
      }
    }
    console.log(`   ✓ All ${assignmentHistory.length} assignment_history records inserted`);
  });

  console.log('\n' + '='.repeat(60));
  console.log('🎉 ALL TESTS PASSED!');
  console.log('='.repeat(60));
}

main().catch((error) => {
  console.error('\n💥 Test suite failed!');
  process.exit(1);
});
