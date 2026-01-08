#!/usr/bin/env node

const fs = require('fs');
const path = require('path');
const crypto = require('crypto');

// Generate UUID v4
function generateUUID() {
  return crypto.randomUUID();
}

// Directory containing data files
const dataDir = path.join(__dirname, 'data');

// Files to update
const files = [
  'lessons.json',
  'lesson_songs.json',
  'assignments.json',
  'student_song_progress.json',
  'practice_sessions.json',
  'song_status_history.json',
  'lesson_history.json',
  'assignment_history.json',
  'user_history.json',
  'assignment_templates.json',
  'ai_conversations.json',
  'ai_messages.json',
  'ai_prompt_templates.json',
  'ai_usage_stats.json',
  'agent_execution_logs.json',
  'api_keys.json',
  'webhook_subscriptions.json'
];

console.log('🔄 Converting IDs to proper UUIDs...\n');

// Keep a map of old IDs to new UUIDs for foreign key references
const idMappings = {};

files.forEach(fileName => {
  const filePath = path.join(dataDir, fileName);
  
  if (!fs.existsSync(filePath)) {
    console.log(`⏭️  Skipping ${fileName} (not found)`);
    return;
  }
  
  const data = JSON.parse(fs.readFileSync(filePath, 'utf8'));
  const tableName = fileName.replace('.json', '');
  idMappings[tableName] = {};
  
  // First pass: Generate new UUIDs for all IDs
  data.forEach(record => {
    if (record.id) {
      const oldId = record.id;
      const newId = generateUUID();
      idMappings[tableName][oldId] = newId;
      record.id = newId;
    }
  });
  
  // Save immediately after updating IDs
  fs.writeFileSync(filePath, JSON.stringify(data, null, 2));
  
  console.log(`✓ ${fileName.padEnd(35)} ${data.length} records`);
});

// Second pass: Update foreign key references
console.log('\n🔗 Updating foreign key references...\n');

const foreignKeyMappings = {
  'lesson_songs.json': { lesson_id: 'lessons', song_id: null },
  'assignments.json': { lesson_id: 'lessons' },
  'student_song_progress.json': { song_id: null },
  'practice_sessions.json': { song_id: null },
  'song_status_history.json': { song_id: null },
  'lesson_history.json': { lesson_id: 'lessons' },
  'assignment_history.json': { assignment_id: 'assignments' },
  'ai_messages.json': { conversation_id: 'ai_conversations' }
};

Object.entries(foreignKeyMappings).forEach(([fileName, fkFields]) => {
  const filePath = path.join(dataDir, fileName);
  
  if (!fs.existsSync(filePath)) return;
  
  const data = JSON.parse(fs.readFileSync(filePath, 'utf8'));
  
  data.forEach(record => {
    Object.entries(fkFields).forEach(([field, sourceTable]) => {
      if (record[field] && sourceTable && idMappings[sourceTable] && idMappings[sourceTable][record[field]]) {
        record[field] = idMappings[sourceTable][record[field]];
      }
    });
  });
  
  fs.writeFileSync(filePath, JSON.stringify(data, null, 2));
  console.log(`✓ ${fileName.padEnd(35)} foreign keys updated`);
});

// Write all updated files
files.forEach(fileName => {
  const filePath = path.join(dataDir, fileName);
  
  if (!fs.existsSync(filePath)) return;
  
  const tableName = fileName.replace('.json', '');
  const data = JSON.parse(fs.readFileSync(filePath, 'utf8'));
  
  // Update file with new UUIDs
  fs.writeFileSync(filePath, JSON.stringify(data, null, 2));
});

// Save ID mappings for reference
fs.writeFileSync(
  path.join(dataDir, '_id_mappings.json'),
  JSON.stringify(idMappings, null, 2)
);

console.log('\n✅ All IDs converted to UUIDs');
console.log('📁 ID mappings saved to: data/_id_mappings.json\n');
console.log('🎯 Next step: Run merge-seed-data.js to update the main seed file');
