#!/usr/bin/env node

const { createClient } = require('@supabase/supabase-js');

const supabaseUrl = 'http://127.0.0.1:54321';
const supabaseKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZS1kZW1vIiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImV4cCI6MTk4MzgxMjk5Nn0.EGIM96RAZx35lJzdJsyH-qQwv8Hdp7fsn3W0YpN81IU';

const supabase = createClient(supabaseUrl, supabaseKey);

async function checkSongs() {
  const { data, error, count } = await supabase
    .from('songs')
    .select('id, title', { count: 'exact' });
    
  if (error) {
    console.log('Error:', error.message);
  } else {
    console.log(`Found ${count} songs in total`);
    console.log('\nFirst 10:');
    data.slice(0, 10).forEach(s => console.log(`  - ${s.id.substring(0, 8)}... ${s.title}`));
  }
}

checkSongs();
