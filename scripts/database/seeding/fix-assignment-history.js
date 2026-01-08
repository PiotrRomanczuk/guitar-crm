#!/usr/bin/env node

const fs = require('fs');
const path = require('path');

const dataDir = path.join(__dirname, 'data');

console.log('🔧 Fixing assignment_history references...\n');

// Load current assignments to get correct IDs
const assignmentsPath = path.join(dataDir, 'assignments.json');
const assignments = JSON.parse(fs.readFileSync(assignmentsPath, 'utf8'));

// Create title to ID mapping
const assignmentTitleToId = {};
assignments.forEach(assignment => {
  assignmentTitleToId[assignment.title] = assignment.id;
});

console.log('Assignment mappings:');
Object.entries(assignmentTitleToId).forEach(([title, id]) => {
  console.log(`  ${title}: ${id}`);
});
console.log();

// Load assignment_history
const historyPath = path.join(dataDir, 'assignment_history.json');
const history = JSON.parse(fs.readFileSync(historyPath, 'utf8'));

// Map history records to correct assignment IDs based on the title in new_data
const titleFromHistory = {
  '8e664126-f035-4379-a5e6-daa752be3d30': 'Practice Basic Strumming',
  '564b4dea-74de-4b05-b508-8454c68bae41': 'Learn House of the Rising Sun Verse',
  'a1b2c3d4-e5f6-7890-1234-567890abcdef': 'Whisky Finger Picking Pattern'
};

let updates = 0;
history.forEach(record => {
  const title = titleFromHistory[record.assignment_id];
  if (title && assignmentTitleToId[title]) {
    const newId = assignmentTitleToId[title];
    if (record.assignment_id !== newId) {
      console.log(`✓ ${title}: ${record.assignment_id} → ${newId}`);
      record.assignment_id = newId;
      updates++;
    }
  } else {
    console.warn(`⚠ Could not map assignment_id: ${record.assignment_id}`);
  }
});

fs.writeFileSync(historyPath, JSON.stringify(history, null, 2));
console.log(`\n✅ Updated ${updates} assignment_history references!`);
