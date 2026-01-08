#!/usr/bin/env node

const fs = require('fs');
const path = require('path');

const dataDir = path.join(__dirname, 'data');

console.log('🔧 Fixing ai_messages conversation_id references...\n');

// Read the conversations to get the actual IDs
const conversations = JSON.parse(fs.readFileSync(path.join(dataDir, 'ai_conversations.json'), 'utf8'));
const messages = JSON.parse(fs.readFileSync(path.join(dataDir, 'ai_messages.json'), 'utf8'));

// Map conversations by their title/context for matching
// conv-001: Student Progress Analysis -> dca53ec8...
// conv-002: Lesson Planning -> bbab569f...
// conv-003: Assignment Feedback -> 850b234e...
// conv-004: Practice Tips -> 67377d24...

const conversationMap = {
  'Student Progress Analysis': conversations.find(c => c.title === 'Student Progress Analysis')?.id,
  'Lesson Planning - House of the Rising Sun': conversations.find(c => c.title === 'Lesson Planning - House of the Rising Sun')?.id,
  'Assignment Feedback Generation': conversations.find(c => c.title === 'Assignment Feedback Generation')?.id,
  'Practice Tips for House of the Rising Sun': conversations.find(c => c.title === 'Practice Tips for House of the Rising Sun')?.id,
};

console.log('Conversation mapping:');
Object.entries(conversationMap).forEach(([title, id]) => {
  if (id) console.log(`  ${title.padEnd(50)} → ${id.substring(0, 8)}...`);
});
console.log('');

// Messages 1-2: Student Progress Analysis
// Messages 3-4: Lesson Planning
// Messages 5-6: Practice Tips

let updated = 0;
messages.forEach((msg, index) => {
  let oldId = msg.conversation_id;
  let newId;
  
  if (index === 0 || index === 1) {
    // Student Progress Analysis
    newId = conversationMap['Student Progress Analysis'];
  } else if (index === 2 || index === 3) {
    // Lesson Planning
    newId = conversationMap['Lesson Planning - House of the Rising Sun'];
  } else if (index === 4 || index === 5) {
    // Practice Tips
    newId = conversationMap['Practice Tips for House of the Rising Sun'];
  }
  
  if (newId && newId !== oldId) {
    msg.conversation_id = newId;
    console.log(`✓ Message ${index + 1}: ${oldId.substring(0, 8)}... → ${newId.substring(0, 8)}...`);
    updated++;
  }
});

fs.writeFileSync(path.join(dataDir, 'ai_messages.json'), JSON.stringify(messages, null, 2));

console.log(`\n✅ Updated ${updated} message conversation_ids\n`);
