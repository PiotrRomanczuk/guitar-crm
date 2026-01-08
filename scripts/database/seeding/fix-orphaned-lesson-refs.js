#!/usr/bin/env node

const fs = require('fs');
const path = require('path');

// Mapping of current lessons from database
const lessonMapping = {
  'Introduction to Guitar': '3c4c910b-9713-4441-9d2a-d3157f5ae9fa',
  'Basic Strumming Patterns': '5f66858b-ae1f-408e-b208-01d50568d376',
  'First Song - House of the Rising Sun': '840094fc-ecc5-4bf3-b134-06c317f880f1',
  'Chord Transitions': '40a295fd-4962-4443-9917-7ef244ca56a6',
  'Advanced Strumming Patterns': '0cb5ecf3-5c24-4a6a-98e8-af65d8c5e20c',
  'Rhythm and Timing': '6d7fd671-7ee1-4d98-bb5a-3c130d4ed0ae',
  'Theory Basics': 'efdfc9e4-e979-4800-9587-3b2522cc3736',
  'Guitar Basics': 'bbd0112e-207d-4eff-a898-fe21000f98f9',
  'Learning First Song - Whisky': 'ce3bbbc4-7737-433a-8b0d-e85c4e3797b0',
  'Post-Holiday Review': '520397d5-db4c-468e-9866-42b3dc526873',
  'Holiday Break Cancellation': 'a6b00e3c-aa76-4d29-8ea0-1ec3fae08dff',
  'Chord Practice Session': '57eac036-51df-404e-a643-a5b3161b677b'
};

const dataDir = path.join(__dirname, 'data');

console.log('🔧 Fixing orphaned lesson_id references...\n');

// Fix assignments.json
console.log('📝 Fixing assignments.json...');
const assignmentsPath = path.join(dataDir, 'assignments.json');
const assignments = JSON.parse(fs.readFileSync(assignmentsPath, 'utf8'));

// Map assignments to lessons by semantic matching
const assignmentLessonMap = {
  'Practice Basic Strumming': 'Basic Strumming Patterns',
  'Learn House of the Rising Sun Verse': 'First Song - House of the Rising Sun',
  'Chord Transition Exercise': 'Chord Transitions',
  'Metronome Practice - Hit the Road Jack': 'Rhythm and Timing',
  'Open Chord Practice': 'Guitar Basics',
  'Whisky Finger Picking Pattern': 'Learning First Song - Whisky',
  'Music Theory - Note Reading': 'Theory Basics'
};

let assignmentUpdates = 0;
assignments.forEach(assignment => {
  const lessonTitle = assignmentLessonMap[assignment.title];
  if (lessonTitle && lessonMapping[lessonTitle]) {
    const newLessonId = lessonMapping[lessonTitle];
    if (assignment.lesson_id !== newLessonId) {
      console.log(`  ✓ ${assignment.title}: ${assignment.lesson_id} → ${newLessonId}`);
      assignment.lesson_id = newLessonId;
      assignmentUpdates++;
    }
  } else {
    console.warn(`  ⚠ Could not map assignment: ${assignment.title}`);
  }
});

fs.writeFileSync(assignmentsPath, JSON.stringify(assignments, null, 2));
console.log(`  Updated ${assignmentUpdates} assignment references\n`);

// Fix lesson_songs.json
console.log('🎵 Fixing lesson_songs.json...');
const lessonSongsPath = path.join(dataDir, 'lesson_songs.json');
const lessonSongs = JSON.parse(fs.readFileSync(lessonSongsPath, 'utf8'));

// Map lesson_songs to lessons by semantic matching based on order_in_lesson
const lessonSongMap = [
  { orderRange: [1], lessonTitle: 'Introduction to Guitar' },
  { orderRange: [1], lessonTitle: 'Basic Strumming Patterns' },
  { orderRange: [1], lessonTitle: 'First Song - House of the Rising Sun' },
  { orderRange: [1], lessonTitle: 'Chord Transitions' },
  { orderRange: [1], lessonTitle: 'Learning First Song - Whisky' },
  { orderRange: [1], lessonTitle: 'Guitar Basics' }
];

let lessonSongUpdates = 0;
lessonSongs.forEach((lessonSong, index) => {
  if (index < lessonSongMap.length) {
    const lessonTitle = lessonSongMap[index].lessonTitle;
    if (lessonMapping[lessonTitle]) {
      const newLessonId = lessonMapping[lessonTitle];
      if (lessonSong.lesson_id !== newLessonId) {
        console.log(`  ✓ Record ${index + 1}: ${lessonSong.lesson_id} → ${newLessonId} (${lessonTitle})`);
        lessonSong.lesson_id = newLessonId;
        lessonSongUpdates++;
      }
    }
  }
});

fs.writeFileSync(lessonSongsPath, JSON.stringify(lessonSongs, null, 2));
console.log(`  Updated ${lessonSongUpdates} lesson_song references\n`);

// Fix lesson_history.json
console.log('📚 Fixing lesson_history.json...');
const lessonHistoryPath = path.join(dataDir, 'lesson_history.json');
const lessonHistory = JSON.parse(fs.readFileSync(lessonHistoryPath, 'utf8'));

// Map lesson_history by change_type
const lessonHistoryMap = [
  { changeType: 'lesson_created', lessonTitle: 'Introduction to Guitar' },
  { changeType: 'lesson_updated', lessonTitle: 'Basic Strumming Patterns' },
  { changeType: 'lesson_cancelled', lessonTitle: 'Holiday Break Cancellation' },
  { changeType: 'lesson_rescheduled', lessonTitle: 'Post-Holiday Review' }
];

let historyUpdates = 0;
lessonHistory.forEach((history, index) => {
  if (index < lessonHistoryMap.length) {
    const lessonTitle = lessonHistoryMap[index].lessonTitle;
    if (lessonMapping[lessonTitle]) {
      const newLessonId = lessonMapping[lessonTitle];
      if (history.lesson_id !== newLessonId) {
        console.log(`  ✓ ${history.change_type}: ${history.lesson_id} → ${newLessonId} (${lessonTitle})`);
        history.lesson_id = newLessonId;
        historyUpdates++;
      }
    }
  }
});

fs.writeFileSync(lessonHistoryPath, JSON.stringify(lessonHistory, null, 2));
console.log(`  Updated ${historyUpdates} lesson_history references\n`);

console.log('✅ Fixed all orphaned lesson_id references!');
console.log(`   Total updates: ${assignmentUpdates + lessonSongUpdates + historyUpdates}`);
