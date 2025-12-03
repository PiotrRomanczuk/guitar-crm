#!/usr/bin/env tsx

/**
 * Seed songs into local database
 */

import { createClient } from '@supabase/supabase-js';

const SUPABASE_URL = 'http://127.0.0.1:54321';
const SUPABASE_SERVICE_KEY =
  'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZS1kZW1vIiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImV4cCI6MTk4MzgxMjk5Nn0.EGIM96RAZx35lJzdJsyH-qQwv8Hdp7fsn3W0YpN81IU';

const supabase = createClient(SUPABASE_URL, SUPABASE_SERVICE_KEY);

const SAMPLE_SONGS = [
  {
    title: 'Wonderwall',
    author: 'Oasis',
    level: 'beginner',
    key: 'Em',
    ultimate_guitar_link: 'https://tabs.ultimate-guitar.com/tab/oasis/wonderwall-chords-64134',
  },
  {
    title: 'Hotel California',
    author: 'Eagles',
    level: 'intermediate',
    key: 'Bm',
    ultimate_guitar_link:
      'https://tabs.ultimate-guitar.com/tab/eagles/hotel-california-chords-16039',
  },
  {
    title: 'Stairway to Heaven',
    author: 'Led Zeppelin',
    level: 'advanced',
    key: 'Am',
    ultimate_guitar_link:
      'https://tabs.ultimate-guitar.com/tab/led-zeppelin/stairway-to-heaven-chords-19512',
  },
  {
    title: 'Blackbird',
    author: 'The Beatles',
    level: 'intermediate',
    key: 'G',
    ultimate_guitar_link: 'https://tabs.ultimate-guitar.com/tab/the-beatles/blackbird-chords-19542',
  },
  {
    title: 'Let It Be',
    author: 'The Beatles',
    level: 'beginner',
    key: 'C',
    ultimate_guitar_link: 'https://tabs.ultimate-guitar.com/tab/the-beatles/let-it-be-chords-19540',
  },
  {
    title: 'Smoke on the Water',
    author: 'Deep Purple',
    level: 'beginner',
    key: 'E',
    ultimate_guitar_link:
      'https://tabs.ultimate-guitar.com/tab/deep-purple/smoke-on-the-water-tabs-17765',
  },
  {
    title: 'Nothing Else Matters',
    author: 'Metallica',
    level: 'intermediate',
    key: 'Em',
    ultimate_guitar_link:
      'https://tabs.ultimate-guitar.com/tab/metallica/nothing-else-matters-chords-49291',
  },
  {
    title: 'Tears in Heaven',
    author: 'Eric Clapton',
    level: 'intermediate',
    key: 'A',
    ultimate_guitar_link:
      'https://tabs.ultimate-guitar.com/tab/eric-clapton/tears-in-heaven-chords-19421',
  },
  {
    title: 'Sweet Child O Mine',
    author: 'Guns N Roses',
    level: 'advanced',
    key: 'D',
    ultimate_guitar_link:
      'https://tabs.ultimate-guitar.com/tab/guns-n-roses/sweet-child-o-mine-chords-19623',
  },
  {
    title: 'Wish You Were Here',
    author: 'Pink Floyd',
    level: 'intermediate',
    key: 'G',
    ultimate_guitar_link:
      'https://tabs.ultimate-guitar.com/tab/pink-floyd/wish-you-were-here-chords-19741',
  },
  {
    title: 'Knockin on Heavens Door',
    author: 'Bob Dylan',
    level: 'beginner',
    key: 'G',
    ultimate_guitar_link:
      'https://tabs.ultimate-guitar.com/tab/bob-dylan/knockin-on-heavens-door-chords-19268',
  },
  {
    title: 'Crazy Little Thing Called Love',
    author: 'Queen',
    level: 'beginner',
    key: 'D',
    ultimate_guitar_link:
      'https://tabs.ultimate-guitar.com/tab/queen/crazy-little-thing-called-love-chords-19785',
  },
  {
    title: 'Under the Bridge',
    author: 'Red Hot Chili Peppers',
    level: 'intermediate',
    key: 'E',
    ultimate_guitar_link:
      'https://tabs.ultimate-guitar.com/tab/red-hot-chili-peppers/under-the-bridge-chords-19804',
  },
  {
    title: 'Come As You Are',
    author: 'Nirvana',
    level: 'beginner',
    key: 'Em',
    ultimate_guitar_link:
      'https://tabs.ultimate-guitar.com/tab/nirvana/come-as-you-are-chords-19732',
  },
  {
    title: 'The Scientist',
    author: 'Coldplay',
    level: 'beginner',
    key: 'Dm',
    ultimate_guitar_link:
      'https://tabs.ultimate-guitar.com/tab/coldplay/the-scientist-chords-19305',
  },
];

async function seedSongs() {
  console.log('🎵 Seeding songs...\n');

  try {
    const { data, error } = await supabase.from('songs').insert(SAMPLE_SONGS).select();

    if (error) {
      console.error('❌ Error seeding songs:', error.message);
      process.exit(1);
    }

    console.log(`✅ Successfully seeded ${data.length} songs!\n`);

    // Show summary by difficulty
    const levels = { beginner: 0, intermediate: 0, advanced: 0 };
    data.forEach((song) => {
      if (song.level in levels) {
        levels[song.level as keyof typeof levels]++;
      }
    });

    console.log('📊 Songs by difficulty:');
    console.log(`   Beginner: ${levels.beginner}`);
    console.log(`   Intermediate: ${levels.intermediate}`);
    console.log(`   Advanced: ${levels.advanced}`);
  } catch (err) {
    console.error('❌ Unexpected error:', err);
    process.exit(1);
  }
}

seedSongs();
