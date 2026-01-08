#!/usr/bin/env tsx

/**
 * Setup Test Songs for AI Spotify Matching
 *
 * Seeds the local database with some "terrible" song entries to test
 * the AI-enhanced Spotify matching functionality.
 */

import { createClient } from '@supabase/supabase-js';
import { Database } from '../database.types';

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || 'http://127.0.0.1:54321';
const supabaseServiceKey =
  process.env.SUPABASE_SERVICE_ROLE_KEY ||
  'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZS1kZW1vIiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImV4cCI6MTk4MzgxMjk5Nn0.EGIM96RAZx35lJzdJsyH-qQwv8Hdp7fsn3W0YpN81IU';

const supabase = createClient<Database>(supabaseUrl, supabaseServiceKey);

// Sample "terrible" database entries for testing
const TERRIBLE_TEST_SONGS = [
  {
    title: 'Stariway To Heaven', // Misspelled
    author: 'Led Zepellin', // Misspelled
    level: 'advanced' as const,
    key: 'Am' as const,
    ultimate_guitar_link: 'https://example.com/test1',
  },
  {
    title: 'Hotel California (Live)', // Extra words
    author: 'The Eagles', // Should be just "Eagles"
    level: 'intermediate' as const,
    key: 'Bm' as const,
    ultimate_guitar_link: 'https://example.com/test2',
  },
  {
    title: 'sweet child o mine', // All lowercase
    author: 'guns n roses', // All lowercase, missing apostrophe
    level: 'advanced' as const,
    key: 'D' as const,
    ultimate_guitar_link: 'https://example.com/test3',
  },
  {
    title: 'Blackbrd', // Shortened/misspelled
    author: 'Beatles', // Missing "The"
    level: 'intermediate' as const,
    key: 'G' as const,
    ultimate_guitar_link: 'https://example.com/test4',
  },
  {
    title: 'Wonderwall - acoustic', // Extra descriptor
    author: 'Oasis band', // Extra word
    level: 'beginner' as const,
    key: 'Em' as const,
    ultimate_guitar_link: 'https://example.com/test5',
  },
  {
    title: 'Bohemian Rhpsody', // Typo
    author: 'Queen',
    level: 'advanced' as const,
    key: 'Bb' as const,
    ultimate_guitar_link: 'https://example.com/test6',
  },
  {
    title: 'Dont Stop Believin', // Missing apostrophe
    author: 'Journey Band', // Extra word
    level: 'beginner' as const,
    key: 'E' as const,
    ultimate_guitar_link: 'https://example.com/test7',
  },
  {
    title: 'Wish You Were Here (PF)', // Artist abbreviation in title
    author: 'PF', // Too abbreviated
    level: 'intermediate' as const,
    key: 'G' as const,
    ultimate_guitar_link: 'https://example.com/test8',
  },
];

async function setupTestSongs() {
  console.log('🎵 Setting up test songs for AI Spotify matching...\n');

  try {
    // Clear existing test songs
    console.log('🧹 Clearing existing test songs...');
    const { error: deleteError } = await supabase
      .from('songs')
      .delete()
      .ilike('title', '%test%')
      .or('ultimate_guitar_link.like.*example.com*');

    if (deleteError) {
      console.warn('Warning clearing test songs:', deleteError.message);
    }

    // Insert terrible test songs
    console.log('📝 Inserting "terrible" test songs...');
    const { data, error } = await supabase.from('songs').insert(TERRIBLE_TEST_SONGS).select();

    if (error) {
      console.error('❌ Error inserting test songs:', error.message);
      process.exit(1);
    }

    console.log(`✅ Successfully inserted ${data.length} test songs!\n`);

    console.log('📋 Test songs added:');
    data.forEach((song, i) => {
      console.log(`   ${i + 1}. "${song.title}" by "${song.author}"`);
      console.log(`      Issues: Likely typos/formatting problems`);
    });

    console.log('\n🚀 Now you can test the AI-enhanced Spotify matching!');
    console.log('\nNext steps:');
    console.log('1. Run: npm run dev');
    console.log('2. Go to the songs page in your app');
    console.log('3. Click "Sync Spotify" → "🤖 AI-Enhanced Sync"');
    console.log('4. Watch the AI try to match these terrible entries!');

    console.log('\n💡 Or run the test script:');
    console.log('   npx tsx scripts/test-ai-spotify-matching.ts');
  } catch (error) {
    console.error('❌ Setup failed:', error);
    process.exit(1);
  }
}

async function checkDatabase() {
  console.log('🔍 Checking database connection...');

  const { count, error } = await supabase.from('songs').select('*', { count: 'exact', head: true });

  if (error) {
    console.error('❌ Database connection failed:', error.message);
    console.log('\n💡 Make sure your Supabase database is running:');
    console.log('   npx supabase start');
    process.exit(1);
  }

  console.log(`✅ Database connected. Currently ${count || 0} songs in database.`);
  return true;
}

async function main() {
  console.log('🎼 AI-Enhanced Spotify Matching Setup\n');
  console.log('='.repeat(50));

  // Check database first
  await checkDatabase();

  // Setup test songs
  await setupTestSongs();

  console.log('\n' + '='.repeat(50));
  console.log('✅ Setup complete! Ready to test AI-enhanced matching.');
}

// Run if called directly
if (import.meta.url === `file://${process.argv[1]}`) {
  main().catch(console.error);
}
