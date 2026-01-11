#!/usr/bin/env node

const { createClient } = require('@supabase/supabase-js');

const supabaseUrl = 'http://127.0.0.1:54321';
const supabaseKey =
  'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZS1kZW1vIiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImV4cCI6MTk4MzgxMjk5Nn0.EGIM96RAZx35lJzdJsyH-qQwv8Hdp7fsn3W0YpN81IU';

const supabase = createClient(supabaseUrl, supabaseKey);

async function clearAll() {
  console.log('🗑️  Clearing all seeded data using SQL...\n');

  // Use raw SQL to delete with CASCADE or in proper order
  const deleteStatements = [
    'DELETE FROM ai_messages',
    'DELETE FROM ai_conversations',
    'DELETE FROM assignment_history',
    'DELETE FROM lesson_history',
    'DELETE FROM song_status_history',
    'DELETE FROM practice_sessions',
    'DELETE FROM student_song_progress',
    'DELETE FROM lesson_songs',
    'DELETE FROM assignments',
    'DELETE FROM user_history',
    'DELETE FROM lessons',
  ];

  for (const sql of deleteStatements) {
    const table = sql.split(' FROM ')[1];
    const { data, error } = await supabase.rpc('exec_sql', { sql_query: sql });

    if (error) {
      console.log(`❌ ${table.padEnd(30)} Error: ${error.message}`);
    } else {
      console.log(`✓ ${table.padEnd(30)} cleared`);
    }
  }

  console.log('\n✅ Done');
}

clearAll().catch(console.error);
