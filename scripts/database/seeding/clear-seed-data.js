#!/usr/bin/env node

const { createClient } = require('@supabase/supabase-js');

const supabaseUrl = 'http://127.0.0.1:54321';
const supabaseKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZS1kZW1vIiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImV4cCI6MTk4MzgxMjk5Nn0.EGIM96RAZx35lJzdJsyH-qQwv8Hdp7fsn3W0YpN81IU';

const supabase = createClient(supabaseUrl, supabaseKey, {
  auth: {
    autoRefreshToken: false,
    persistSession: false
  }
});

const tablesToClear = [
  'ai_messages',
  'ai_conversations',
  'assignment_history',
  'lesson_history',  // Clear history before lessons
  'song_status_history',
  'practice_sessions',
  'student_song_progress',
  'lesson_songs',
  'assignments',
  'user_history',  // Add user_history
  'lessons'
];

async function clearTables() {
  console.log('🗑️  Clearing seed data tables...\n');
  
  for (const table of tablesToClear) {
    try {
      const { data, error, count } = await supabase
        .from(table)
        .delete()
        .neq('id', '00000000-0000-0000-0000-000000000000')
        .select('id', { count: 'exact', head: true });
      
      if (error) {
        console.log(`❌ ${table.padEnd(30)} Error: ${error.message}`);
      } else {
        const { count: remaining } = await supabase
          .from(table)
          .select('id', { count: 'exact', head: true });
        console.log(`✓ ${table.padEnd(30)} cleared (${remaining || 0} remaining)`);
      }
    } catch (err) {
      console.log(`❌ ${table.padEnd(30)} Exception: ${err.message}`);
    }
  }
  
  console.log('\n✅ Cleared all seed data tables');
}

clearTables().catch(console.error);
