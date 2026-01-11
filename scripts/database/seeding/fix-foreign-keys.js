#!/usr/bin/env node

const fs = require('fs');
const path = require('path');

const dataDir = path.join(__dirname, 'data');
const mappingsPath = path.join(dataDir, '_id_mappings.json');
const mappings = JSON.parse(fs.readFileSync(mappingsPath, 'utf8'));

console.log('🔧 Fixing remaining foreign key and context_id issues...\n');

// Fix ai_conversations context_ids
const conversationsPath = path.join(dataDir, 'ai_conversations.json');
const conversations = JSON.parse(fs.readFileSync(conversationsPath, 'utf8'));

conversations.forEach((conv) => {
  if (conv.context_type === 'lesson' && conv.context_id.startsWith('lesson-')) {
    const oldId = conv.context_id;
    const newId = mappings.lessons[oldId];
    if (newId) {
      conv.context_id = newId;
      console.log(`✓ Updated conversation ${conv.id}: ${oldId} → ${newId.substring(0, 8)}...`);
    }
  } else if (conv.context_type === 'assignment' && conv.context_id.startsWith('assign-')) {
    const oldId = conv.context_id;
    const newId = mappings.assignments[oldId];
    if (newId) {
      conv.context_id = newId;
      console.log(`✓ Updated conversation ${conv.id}: ${oldId} → ${newId.substring(0, 8)}...`);
    }
  } else if (conv.context_type === 'practice' && conv.context_id.startsWith('ps-')) {
    const oldId = conv.context_id;
    const newId = mappings.practice_sessions[oldId];
    if (newId) {
      conv.context_id = newId;
      console.log(`✓ Updated conversation ${conv.id}: ${oldId} → ${newId.substring(0, 8)}...`);
    }
  }
});

fs.writeFileSync(conversationsPath, JSON.stringify(conversations, null, 2));
console.log('\n✅ ai_conversations.json updated\n');

// Prepare seed data
console.log('📋 Preparing seed data for insertion...\n');

const seedFilePath = path.join(__dirname, 'exported/seed-data-2026-01-08.json');
const seedData = JSON.parse(fs.readFileSync(seedFilePath, 'utf8'));

// Skip spotify_matches that already exist
const tablesToSkip = ['public.spotify_matches'];

tablesToSkip.forEach((table) => {
  if (seedData.tables[table]) {
    console.log(`⏭️  Skipping ${table.padEnd(35)} (data already exists)`);
    seedData.tables[table].data = [];
    seedData.tables[table].count = 0;
  }
});

// Update export date
seedData.exportDate = new Date().toISOString();

// Write updated seed data
fs.writeFileSync(seedFilePath, JSON.stringify(seedData, null, 2));

console.log('\n✅ Seed file updated - spotify_matches skipped');
console.log('📁 Output: exported/seed-data-2026-01-08.json\n');
console.log('🎯 Ready to seed! Run: node seed-local-db.js --clear\n');
