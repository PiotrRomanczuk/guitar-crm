#!/usr/bin/env tsx

/**
 * Import 100 Guitar Classics from CSV
 *
 * Usage:
 *   npx tsx scripts/database/seeding/import-100-classics.ts              # Import to local DB
 *   npx tsx scripts/database/seeding/import-100-classics.ts --remote     # Import to remote DB
 *   npx tsx scripts/database/seeding/import-100-classics.ts --dry-run    # Preview without importing
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

const CSV_FILE_PATH = path.join(process.cwd(), 'data', '100-guitar-classics.csv');

// Valid enum values (database only has 3 levels, expert maps to advanced)
const VALID_LEVELS = ['beginner', 'intermediate', 'advanced'];
const VALID_KEYS = [
  'C', 'C#', 'Db', 'D', 'D#', 'Eb', 'E', 'F', 'F#', 'Gb', 'G', 'G#', 'Ab', 'A', 'A#', 'Bb', 'B',
  'Cm', 'C#m', 'Dm', 'D#m', 'Ebm', 'Em', 'Fm', 'F#m', 'Gm', 'G#m', 'Am', 'A#m', 'Bbm', 'Bm',
];

interface CSVRow {
  title: string;
  author: string;
  difficulty: string;
  key: string;
  capo_fret: string;
  category: string;
  chords: string;
  release_year: string;
  tempo: string;
  time_signature: string;
  strumming_pattern: string;
  youtube_search: string;
  ultimate_guitar_search: string;
}

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

function parseCSV(csvContent: string): CSVRow[] {
  const lines = csvContent.split('\n');
  const headers = parseCSVLine(lines[0]);
  const rows: CSVRow[] = [];

  for (let i = 1; i < lines.length; i++) {
    const line = lines[i].trim();
    if (!line) continue;

    const values = parseCSVLine(line);
    if (values.length !== headers.length) {
      console.warn(`⚠️  Skipping malformed line ${i + 1}`);
      continue;
    }

    const row: Record<string, string> = {};
    headers.forEach((header, index) => {
      row[header] = values[index];
    });

    rows.push(row as CSVRow);
  }

  return rows;
}

function parseCSVLine(line: string): string[] {
  const result: string[] = [];
  let current = '';
  let inQuotes = false;

  for (let i = 0; i < line.length; i++) {
    const char = line[i];
    const nextChar = line[i + 1];

    if (char === '"' && inQuotes && nextChar === '"') {
      // Escaped quote
      current += '"';
      i++; // Skip next quote
    } else if (char === '"') {
      // Toggle quote mode
      inQuotes = !inQuotes;
    } else if (char === ',' && !inQuotes) {
      // End of field
      result.push(current);
      current = '';
    } else {
      current += char;
    }
  }

  result.push(current);
  return result;
}

function normalizeSong(row: CSVRow) {
  // Map CSV difficulty to DB level (expert -> advanced)
  let level = row.difficulty;
  if (level === 'expert') {
    level = 'advanced';
  } else if (!VALID_LEVELS.includes(level)) {
    level = 'beginner';
  }

  const key = VALID_KEYS.includes(row.key) ? row.key : 'C';

  const capoFret = row.capo_fret ? parseInt(row.capo_fret, 10) : null;
  const tempo = row.tempo ? parseInt(row.tempo, 10) : null;
  const timeSignature = row.time_signature ? parseInt(row.time_signature, 10) : null;
  const releaseYear = row.release_year ? parseInt(row.release_year, 10) : null;

  return {
    title: row.title,
    author: row.author,
    level, // Database uses 'level' not 'difficulty'
    key,
    capo_fret: capoFret,
    category: row.category || null,
    chords: row.chords || null,
    release_year: releaseYear,
    tempo,
    time_signature: timeSignature,
    strumming_pattern: row.strumming_pattern || null,
  };
}

async function importSongs(supabase: SupabaseClient, songs: unknown[], dryRun: boolean) {
  if (dryRun) {
    console.log('🔍 DRY RUN MODE - No data will be inserted\n');
    console.log('Sample of songs to import:');
    console.log(JSON.stringify(songs.slice(0, 3), null, 2));
    console.log(`\n... and ${songs.length - 3} more songs`);
    return;
  }

  const BATCH_SIZE = 50;
  let successCount = 0;
  let errorCount = 0;

  for (let i = 0; i < songs.length; i += BATCH_SIZE) {
    const batch = songs.slice(i, i + BATCH_SIZE);
    const batchNum = Math.floor(i / BATCH_SIZE) + 1;
    const totalBatches = Math.ceil(songs.length / BATCH_SIZE);

    const { error, data } = await supabase.from('songs').insert(batch).select();

    if (error) {
      console.error(`❌ Error inserting batch ${batchNum}:`, error.message);
      errorCount += batch.length;
    } else {
      console.log(`✅ Batch ${batchNum}/${totalBatches} (${data?.length || batch.length} songs)`);
      successCount += data?.length || batch.length;
    }
  }

  console.log(`\n📊 Import Summary:`);
  console.log(`   ✅ Success: ${successCount} songs`);
  if (errorCount > 0) {
    console.log(`   ❌ Failed: ${errorCount} songs`);
  }
}

async function main() {
  console.log('🎸 100 GUITAR CLASSICS IMPORTER');
  console.log('================================\n');

  const args = process.argv.slice(2);
  const useRemote = args.includes('--remote');
  const dryRun = args.includes('--dry-run');

  if (!fs.existsSync(CSV_FILE_PATH)) {
    console.error(`❌ CSV file not found: ${CSV_FILE_PATH}`);
    process.exit(1);
  }

  console.log(`📂 Reading CSV from ${CSV_FILE_PATH}...\n`);

  const csvContent = fs.readFileSync(CSV_FILE_PATH, 'utf-8');
  const rows = parseCSV(csvContent);

  console.log(`📦 Found ${rows.length} songs in CSV\n`);

  // Group by difficulty
  const byDifficulty = rows.reduce((acc, row) => {
    const diff = row.difficulty;
    acc[diff] = (acc[diff] || 0) + 1;
    return acc;
  }, {} as Record<string, number>);

  console.log('📊 Breakdown by difficulty:');
  Object.entries(byDifficulty)
    .sort((a, b) => {
      const order = ['beginner', 'intermediate', 'advanced', 'expert'];
      return order.indexOf(a[0]) - order.indexOf(b[0]);
    })
    .forEach(([diff, count]) => {
      console.log(`   ${diff.padEnd(14)}: ${count} songs`);
    });
  console.log();

  const songsToInsert = rows.map(normalizeSong);

  const supabase = getClient(useRemote);

  try {
    await importSongs(supabase, songsToInsert, dryRun);

    if (!dryRun) {
      console.log('\n✅ Import complete!');
    }
  } catch (error) {
    console.error('\n❌ Error:', error);
    process.exit(1);
  }
}

main().catch(console.error);
