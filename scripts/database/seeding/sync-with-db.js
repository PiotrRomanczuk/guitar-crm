#!/usr/bin/env node

const { createClient } = require('@supabase/supabase-js');
const fs = require('fs');
const path = require('path');

const supabaseUrl = 'http://127.0.0.1:54321';
const supabaseKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZS1kZW1vIiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImV4cCI6MTk4MzgxMjk5Nn0.EGIM96RAZx35lJzdJsyH-qQwv8Hdp7fsn3W0YpN81IU';

const supabase = createClient(supabaseUrl, supabaseKey);
const dataDir = path.join(__dirname, 'data');

async function syncWithDatabase() {
  console.log('🔄 Syncing seed data with existing database records...\n');
  
  // Get existing lessons from database
  const { data: dbLessons, error: lessonsError } = await supabase
    .from('lessons')
    .select('id, title, student_id, teacher_id, scheduled_at');
  
  if (lessonsError) {
    console.error('Error fetching lessons:', lessonsError.message);
    return;
  }
  
  console.log(`Found ${dbLessons.length} lessons in database\n`);
  
  // Load our seed lessons
  const lessonsPath = path.join(dataDir, 'lessons.json');
  const seedLessons = JSON.parse(fs.readFileSync(lessonsPath, 'utf8'));
  
  // Create mapping of seed lesson titles to DB IDs
  const titleToId = {};
  const seedIdToDbId = {};
  
  dbLessons.forEach(dbLesson => {
    const match = seedLessons.find(sl => sl.title === dbLesson.title);
    if (match) {
      titleToId[dbLesson.title] = dbLesson.id;
      seedIdToDbId[match.id] = dbLesson.id;
      console.log(`✓ Matched: "${dbLesson.title}"`);
      console.log(`  Seed: ${match.id.substring(0, 8)}... → DB: ${dbLesson.id.substring(0, 8)}...`);
    }
  });
  
  console.log(`\n📊 Matched ${Object.keys(seedIdToDbId).length} lessons\n`);
  
  // Update foreign keys in dependent tables
  const filesToUpdate = [
    'assignments.json',
    'lesson_songs.json',
    'lesson_history.json'
  ];
  
  filesToUpdate.forEach(fileName => {
    const filePath = path.join(dataDir, fileName);
    if (!fs.existsSync(filePath)) return;
    
    const data = JSON.parse(fs.readFileSync(filePath, 'utf8'));
    let updated = 0;
    
    data.forEach(record => {
      if (record.lesson_id && seedIdToDbId[record.lesson_id]) {
        const oldId = record.lesson_id;
        record.lesson_id = seedIdToDbId[record.lesson_id];
        console.log(`  ${oldId.substring(0, 8)}... → ${record.lesson_id.substring(0, 8)}...`);
        updated++;
      }
    });
    
    if (updated > 0) {
      fs.writeFileSync(filePath, JSON.stringify(data, null, 2));
      console.log(`✓ ${fileName.padEnd(30)} ${updated} lesson_id references updated\n`);
    }
  });
  
  console.log('\n✅ Sync complete!\n');
}

syncWithDatabase().catch(console.error);
