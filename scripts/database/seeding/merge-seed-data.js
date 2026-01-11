#!/usr/bin/env node

const fs = require('fs');
const path = require('path');

// Read the main seed data file
const seedFilePath = path.join(__dirname, 'exported/seed-data-2026-01-08.json');
const seedData = JSON.parse(fs.readFileSync(seedFilePath, 'utf8'));

// Directory containing individual table data files
const dataDir = path.join(__dirname, 'data');

// Map of file names to table names
const tableMapping = {
  'profiles.json': 'public.profiles',
  'songs.json': 'public.songs',
  'lessons.json': 'public.lessons',
  'lesson_songs.json': 'public.lesson_songs',
  'assignments.json': 'public.assignments',
  'student_song_progress.json': 'public.student_song_progress',
  'practice_sessions.json': 'public.practice_sessions',
  'song_status_history.json': 'public.song_status_history',
  'lesson_history.json': 'public.lesson_history',
  'assignment_history.json': 'public.assignment_history',
  'user_history.json': 'public.user_history',
  'assignment_templates.json': 'public.assignment_templates',
  'ai_conversations.json': 'public.ai_conversations',
  'ai_messages.json': 'public.ai_messages',
  'ai_prompt_templates.json': 'public.ai_prompt_templates',
  'ai_usage_stats.json': 'public.ai_usage_stats',
  'agent_execution_logs.json': 'public.agent_execution_logs',
  'api_keys.json': 'public.api_keys',
  'user_integrations.json': 'public.user_integrations',
  'webhook_subscriptions.json': 'public.webhook_subscriptions',
};

console.log('🔄 Merging seed data files...\n');

let totalRecords = 0;

// Process each file
Object.entries(tableMapping).forEach(([fileName, tableName]) => {
  const filePath = path.join(dataDir, fileName);

  if (fs.existsSync(filePath)) {
    const tableData = JSON.parse(fs.readFileSync(filePath, 'utf8'));

    if (seedData.tables[tableName]) {
      seedData.tables[tableName].data = tableData;
      seedData.tables[tableName].count = tableData.length;

      console.log(`✓ ${tableName.padEnd(35)} ${tableData.length} records`);
      totalRecords += tableData.length;
    } else {
      console.log(`⚠ Warning: Table ${tableName} not found in seed data structure`);
    }
  } else {
    console.log(`⚠ Warning: File ${fileName} not found`);
  }
});

// Update export date
seedData.exportDate = new Date().toISOString();

// Write updated seed data back to file
fs.writeFileSync(seedFilePath, JSON.stringify(seedData, null, 2));

console.log(`\n✅ Successfully merged ${totalRecords} records into seed file`);
console.log(`📁 Output: ${seedFilePath}`);
console.log(`📅 Export date: ${seedData.exportDate}`);

// Generate summary
console.log('\n📊 Summary by table:');
Object.entries(seedData.tables)
  .filter(([_, table]) => table.count > 0)
  .sort((a, b) => b[1].count - a[1].count)
  .forEach(([tableName, table]) => {
    console.log(`   ${tableName.padEnd(35)} ${String(table.count).padStart(4)} records`);
  });

console.log('\n🎉 Done!');
