#!/usr/bin/env node

const { createClient } = require('@supabase/supabase-js');

const supabaseUrl = 'http://127.0.0.1:54321';
const supabaseKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZS1kZW1vIiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImV4cCI6MTk4MzgxMjk5Nn0.EGIM96RAZx35lJzdJsyH-qQwv8Hdp7fsn3W0YpN81IU';

const supabase = createClient(supabaseUrl, supabaseKey);

async function forceDeleteLessons() {
  console.log('🗑️  Force deleting lessons...\n');
  
  // Get all lessons
  const { data: lessons } = await supabase.from('lessons').select('id, title');
  
  if (!lessons || lessons.length === 0) {
    console.log('No lessons to delete');
    return;
  }
  
  console.log(`Found ${lessons.length} lessons to delete:\n`);
  lessons.forEach(l => console.log(`  - ${l.title}`));
  console.log('');
  
  // Delete each one individually
  for (const lesson of lessons) {
    const { error } = await supabase
      .from('lessons')
      .delete()
      .eq('id', lesson.id);
    
    if (error) {
      console.log(`❌ ${lesson.title.padEnd(40)} ${error.message}`);
    } else {
      console.log(`✓ ${lesson.title.padEnd(40)} deleted`);
    }
  }
  
  // Verify
  const { data: remaining } = await supabase.from('lessons').select('id', { count: 'exact', head: true });
  console.log(`\n✅ Done - ${remaining?.length || 0} lessons remaining\n`);
}

forceDeleteLessons().catch(console.error);
