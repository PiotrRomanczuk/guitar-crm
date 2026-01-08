#!/usr/bin/env node

const { createClient } = require('@supabase/supabase-js');

const supabaseUrl = 'http://127.0.0.1:54321';
const supabaseKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZS1kZW1vIiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImV4cCI6MTk4MzgxMjk5Nn0.EGIM96RAZx35lJzdJsyH-qQwv8Hdp7fsn3W0YpN81IU';

const supabase = createClient(supabaseUrl, supabaseKey);

async function diagnose() {
  console.log('🔍 Diagnosing database state...\n');
  
  // Check lessons
  const { data: lessons, error: lessonsError } = await supabase
    .from('lessons')
    .select('id, title')
    .limit(5);
    
  if (lessonsError) {
    console.log('❌ Lessons error:', lessonsError.message);
  } else {
    console.log(`✓ Found ${lessons.length} lessons:`);
    lessons.forEach(l => console.log(`  - ${l.id.substring(0, 8)}... ${l.title}`));
  }
  
  console.log('');
  
  // Check assignments
  const { data: assignments, error: assignError } = await supabase
    .from('assignments')
    .select('id, title, lesson_id')
    .limit(5);
    
  if (assignError) {
    console.log('❌ Assignments error:', assignError.message);
  } else {
    console.log(`✓ Found ${assignments.length} assignments:`);
    assignments.forEach(a => console.log(`  - ${a.id.substring(0, 8)}... ${a.title} (lesson: ${a.lesson_id ? a.lesson_id.substring(0, 8) + '...' : 'null'})`));
  }
  
  console.log('');
  
  // Check user_integrations
  const { data: integrations, error: intError } = await supabase
    .from('user_integrations')
    .select('id, user_id, provider');
    
  if (intError) {
    console.log('❌ User integrations error:', intError.message);
  } else {
    console.log(`✓ Found ${integrations.length} user integrations:`);
    integrations.forEach(i => console.log(`  - ${i.id.substring(0, 8)}... ${i.provider} (user: ${i.user_id.substring(0, 8)}...)`));
  }
  
  console.log('');
  
  // Check ai_conversations
  const { data: convs, error: convError } = await supabase
    .from('ai_conversations')
    .select('id, title, context_type, context_id');
    
  if (convError) {
    console.log('❌ AI conversations error:', convError.message);
  } else {
    console.log(`✓ Found ${convs.length} AI conversations:`);
    convs.forEach(c => console.log(`  - ${c.id.substring(0, 8)}... ${c.title} (${c.context_type}: ${c.context_id ? c.context_id.substring(0, 8) + '...' : 'null'})`));
  }
  
  console.log('');
  
  // Check ai_messages  
  const { data: msgs, error: msgError } = await supabase
    .from('ai_messages')
    .select('id, conversation_id, role')
    .limit(5);
    
  if (msgError) {
    console.log('❌ AI messages error:', msgError.message);
  } else {
    console.log(`✓ Found ${msgs.length} AI messages:`);
    msgs.forEach(m => console.log(`  - ${m.id.substring(0, 8)}... ${m.role} (conv: ${m.conversation_id.substring(0, 8)}...)`));
  }
}

diagnose().catch(console.error);
