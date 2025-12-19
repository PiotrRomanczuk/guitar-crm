
import { createClient } from '@supabase/supabase-js';
import dotenv from 'dotenv';
import fs from 'fs';
import path from 'path';

// Load environment variables from .env.local
dotenv.config({ path: '.env.local' });

const SUPABASE_URL = process.env.NEXT_PUBLIC_SUPABASE_URL;
const SUPABASE_SERVICE_KEY = process.env.SUPABASE_SERVICE_ROLE_KEY;

if (!SUPABASE_URL || !SUPABASE_SERVICE_KEY) {
  console.error('Error: NEXT_PUBLIC_SUPABASE_URL and SUPABASE_SERVICE_ROLE_KEY must be set in .env.local');
  process.exit(1);
}

const supabase = createClient(SUPABASE_URL, SUPABASE_SERVICE_KEY);

const SONGS_FILE_PATH = path.join(process.cwd(), '.LEGACY_DATA', 'songs.json');

// Enums from database.types.ts
const VALID_LEVELS = ['beginner', 'intermediate', 'advanced'];
const VALID_KEYS = [
  'C', 'C#', 'Db', 'D', 'D#', 'Eb', 'E', 'F', 'F#', 'Gb', 'G', 'G#', 'Ab', 'A', 'A#', 'Bb', 'B',
  'Cm', 'C#m', 'Dm', 'D#m', 'Ebm', 'Em', 'Fm', 'F#m', 'Gm', 'G#m', 'Am', 'A#m', 'Bbm', 'Bm'
];

async function seedSongs() {
  try {
    console.log(`Reading songs from ${SONGS_FILE_PATH}...`);
    const fileContent = fs.readFileSync(SONGS_FILE_PATH, 'utf-8');
    const songsData = JSON.parse(fileContent);

    console.log(`Found ${songsData.length} songs.`);

    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const songsToInsert = songsData.map((song: any) => {
      // Handle required fields and defaults
      let level = song.level;
      if (!level || !VALID_LEVELS.includes(level)) {
        level = 'beginner'; // Default to beginner
      }

      let key = song.key;
      if (!key || !VALID_KEYS.includes(key)) {
        // Try to normalize key if possible, or default
        // For now, default to 'C' if invalid or null
        key = 'C'; 
      }

      return {
        id: song.id,
        title: song.title,
        author: song.author || 'Unknown', // Required
        level: level, // Required enum
        key: key, // Required enum
        chords: song.chords,
        ultimate_guitar_link: song.ultimate_guitar_link || 'https://www.ultimate-guitar.com/', // Required
        short_title: song.short_title,
        created_at: song.created_at || new Date().toISOString(),
        updated_at: song.updated_at || new Date().toISOString(),
        // Fields in schema but not in JSON (or mapped)
        deleted_at: null,
        youtube_url: null,
        gallery_images: null
      };
    });

    console.log('Upserting songs to remote database...');
    
    // Insert in batches to avoid hitting limits
    const BATCH_SIZE = 50;
    for (let i = 0; i < songsToInsert.length; i += BATCH_SIZE) {
      const batch = songsToInsert.slice(i, i + BATCH_SIZE);
      const { error } = await supabase.from('songs').upsert(batch);

      if (error) {
        console.error(`Error inserting batch ${i / BATCH_SIZE + 1}:`, error);
      } else {
        console.log(`Inserted batch ${i / BATCH_SIZE + 1} (${batch.length} songs).`);
      }
    }

    console.log('Done!');

  } catch (error) {
    console.error('Error seeding songs:', error);
  }
}

seedSongs();
