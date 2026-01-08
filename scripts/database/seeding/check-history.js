#!/usr/bin/env node

const { createClient } = require('@supabase/supabase-js');

const supabaseUrl = 'http://127.0.0.1:54321';
const supabaseKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZS1kZW1vIiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImV4cCI6MTk4MzgxMjk5Nn0.EGIM96RAZx35lJzdJsyH-qQwv8Hdp7fsn3W0YpN81IU';

const supabase = createClient(supabaseUrl, supabaseKey);

async function checkHistory() {
  const { data, error } = await supabase
    .from('lesson_history')
    .select('*')
    .limit(5);
    
  if (error) {
    console.log('Error:', error.message);
  } else {
    console.log(`Found ${data.length} lesson_history records:`);
    data.forEach(h => console.log(`  - ${h.id} lesson_id: ${h.lesson_id}`));
  }
}

checkHistory();
