#!/usr/bin/env tsx

/**
 * Consolidated Song Seeding Script
 * Seeds songs from JSON file to local or remote database
 *
 * Usage:
 *   npx tsx scripts/database/seeding/seed-songs.ts              # Seed to local DB
 *   npx tsx scripts/database/seeding/seed-songs.ts --remote     # Seed to remote DB
 *   npx tsx scripts/database/seeding/seed-songs.ts --sample     # Seed sample songs only
 */

import { createClient, SupabaseClient } from '@supabase/supabase-js';
import { config } from 'dotenv';
import fs from 'fs';
import path from 'path';

// Load environment variables
config({ path: path.join(process.cwd(), '.env.local') });

// Local Supabase credentials
const LOCAL_URL = 'http://127.0.0.1:54321';
const LOCAL_SERVICE_KEY =
  'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZS1kZW1vIiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImV4cCI6MTk4MzgxMjk5Nn0.EGIM96RAZx35lJzdJsyH-qQwv8Hdp7fsn3W0YpN81IU';

const SONGS_FILE_PATH = path.join(process.cwd(), '.LEGACY_DATA', 'songs.json');

// Valid enum values from database.types.ts
const VALID_LEVELS = ['beginner', 'intermediate', 'advanced'];
const VALID_KEYS = [
  'C',
  'C#',
  'Db',
  'D',
  'D#',
  'Eb',
  'E',
  'F',
  'F#',
  'Gb',
  'G',
  'G#',
  'Ab',
  'A',
  'A#',
  'Bb',
  'B',
  'Cm',
  'C#m',
  'Dm',
  'D#m',
  'Ebm',
  'Em',
  'Fm',
  'F#m',
  'Gm',
  'G#m',
  'Am',
  'A#m',
  'Bbm',
  'Bm',
];

// Sample songs for quick testing
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
];

function getClient(useRemote: boolean): SupabaseClient {
  if (useRemote) {
    const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
    const key = process.env.SUPABASE_SERVICE_ROLE_KEY;

    if (!url || !key) {
      console.error('❌ Missing remote Supabase credentials in .env.local');
      console.error('   Required: NEXT_PUBLIC_SUPABASE_URL, SUPABASE_SERVICE_ROLE_KEY');
      process.exit(1);
    }

    console.log('📍 Targeting REMOTE database\n');
    return createClient(url, key);
  }

  console.log('📍 Targeting LOCAL database\n');
  return createClient(LOCAL_URL, LOCAL_SERVICE_KEY);
}

// eslint-disable-next-line @typescript-eslint/no-explicit-any
function normalizeSong(song: any) {
  let level = song.level;
  if (!level || !VALID_LEVELS.includes(level)) {
    level = 'beginner';
  }

  let key = song.key;
  if (!key || !VALID_KEYS.includes(key)) {
    key = 'C';
  }

  return {
    id: song.id,
    title: song.title,
    author: song.author || 'Unknown',
    level: level,
    key: key,
    chords: song.chords,
    ultimate_guitar_link: song.ultimate_guitar_link || 'https://www.ultimate-guitar.com/',
    short_title: song.short_title,
    created_at: song.created_at || new Date().toISOString(),
    updated_at: song.updated_at || new Date().toISOString(),
    deleted_at: null,
    youtube_url: null,
    gallery_images: null,
  };
}

async function seedFromJSON(supabase: SupabaseClient) {
  console.log(`📂 Reading songs from ${SONGS_FILE_PATH}...\n`);

  if (!fs.existsSync(SONGS_FILE_PATH)) {
    console.error(`❌ Songs file not found: ${SONGS_FILE_PATH}`);
    console.log('   Use --sample flag to seed sample songs instead');
    process.exit(1);
  }

  const fileContent = fs.readFileSync(SONGS_FILE_PATH, 'utf-8');
  const songsData = JSON.parse(fileContent);

  console.log(`📦 Found ${songsData.length} songs.\n`);

  const songsToInsert = songsData.map(normalizeSong);

  await upsertSongs(supabase, songsToInsert);
}

async function seedSampleSongs(supabase: SupabaseClient) {
  console.log('🎸 Seeding sample songs...\n');

  const songsToInsert = SAMPLE_SONGS.map((song) => ({
    ...normalizeSong(song),
    id: undefined, // Let the database generate IDs
  }));

  await upsertSongs(supabase, songsToInsert);
}

async function upsertSongs(supabase: SupabaseClient, songs: unknown[]) {
  const BATCH_SIZE = 50;

  for (let i = 0; i < songs.length; i += BATCH_SIZE) {
    const batch = songs.slice(i, i + BATCH_SIZE);
    const batchNum = Math.floor(i / BATCH_SIZE) + 1;
    const totalBatches = Math.ceil(songs.length / BATCH_SIZE);

    const { error } = await supabase.from('songs').upsert(batch);

    if (error) {
      console.error(`❌ Error inserting batch ${batchNum}:`, error.message);
    } else {
      console.log(`✅ Batch ${batchNum}/${totalBatches} (${batch.length} songs)`);
    }
  }
}

async function main() {
  console.log('🎵 SONG SEEDING UTILITY');
  console.log('=======================\n');

  const args = process.argv.slice(2);
  const useRemote = args.includes('--remote');
  const useSample = args.includes('--sample');

  const supabase = getClient(useRemote);

  try {
    if (useSample) {
      await seedSampleSongs(supabase);
    } else {
      await seedFromJSON(supabase);
    }

    console.log('\n✅ Song seeding complete!');
  } catch (error) {
    console.error('\n❌ Error:', error);
    process.exit(1);
  }
}

main().catch(console.error);
