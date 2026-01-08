#!/usr/bin/env tsx

/**
 * Test AI-Enhanced Spotify Matching
 *
 * This script demonstrates how the AI-powered song matching works
 * with poor quality, "terrible" database entries.
 */

import { searchSongWithAI, searchSongsWithAI } from '@/lib/services/enhanced-spotify-search';
import type { Database } from '@/database.types';

type DatabaseSong = Database['public']['Tables']['songs']['Row'];

// Sample "terrible" database entries that would normally fail matching
const TERRIBLE_SONGS: Partial<DatabaseSong>[] = [
  {
    id: 'test-1',
    title: 'Stariway To Heaven', // Misspelled
    author: 'Led Zepellin', // Misspelled
    level: 'advanced',
    key: 'Am',
  },
  {
    id: 'test-2',
    title: 'Hotel California (Live Version)', // Extra words
    author: 'The Eagles', // Missing "The"
    level: 'intermediate',
    key: 'Bm',
  },
  {
    id: 'test-3',
    title: 'sweet child o mine', // All lowercase
    author: 'guns n roses', // All lowercase, missing apostrophe
    level: 'advanced',
    key: 'D',
  },
  {
    id: 'test-4',
    title: 'Blackbrd', // Shortened/misspelled
    author: 'Beatles', // Missing "The"
    level: 'intermediate',
    key: 'G',
  },
  {
    id: 'test-5',
    title: 'Wonderwall - acoustic', // Extra descriptor
    author: 'Oasis band', // Extra word
    level: 'beginner',
    key: 'Em',
  },
  {
    id: 'test-6',
    title: 'Wish You Were Here (Pink Floyd)', // Artist in title
    author: 'PF', // Abbreviated
    level: 'intermediate',
    key: 'G',
  },
  {
    id: 'test-7',
    title: 'Dont Stop Believin', // Missing apostrophe
    author: 'Journey Band', // Extra word
    level: 'beginner',
    key: 'E',
  },
  {
    id: 'test-8',
    title: 'Bohemian Rhpsody', // Typo
    author: 'Queen', // This one is correct
    level: 'advanced',
    key: 'Bb',
  },
];

async function testSingleSong() {
  console.log('🎵 Testing AI-Enhanced Single Song Matching\n');
  console.log('='.repeat(60));

  const testSong = TERRIBLE_SONGS[0] as DatabaseSong;

  console.log(`🎸 Testing: "${testSong.title}" by "${testSong.author}"`);
  console.log(`   Original quality: Very poor (typos in both title and artist)`);

  try {
    // Test with AI enabled
    console.log('\n🤖 AI-Enhanced Search:');
    const aiResult = await searchSongWithAI(testSong, {
      enableAIAnalysis: true,
      maxQueries: 6,
      minConfidenceScore: 60,
    });

    console.log(`   ✨ Result: ${aiResult.match.confidence}% confidence`);
    console.log(`   ✨ Found: ${aiResult.match.spotifyTrack?.name || 'No match'}`);
    console.log(`   ✨ Artist: ${aiResult.match.spotifyTrack?.artists[0]?.name || 'N/A'}`);
    console.log(`   ✨ Queries used: ${aiResult.queriesUsed}`);
    console.log(`   ✨ Time: ${aiResult.executionTime}ms`);
    console.log(`   ✨ Reason: ${aiResult.match.reason}`);

    // Test without AI for comparison
    console.log('\n⚡ Basic Search (no AI):');
    const basicResult = await searchSongWithAI(testSong, {
      enableAIAnalysis: false,
      maxQueries: 2,
      minConfidenceScore: 60,
    });

    console.log(`   📊 Result: ${basicResult.match.confidence}% confidence`);
    console.log(`   📊 Found: ${basicResult.match.spotifyTrack?.name || 'No match'}`);
    console.log(`   📊 Artist: ${basicResult.match.spotifyTrack?.artists[0]?.name || 'N/A'}`);
    console.log(`   📊 Time: ${basicResult.executionTime}ms`);

    // Compare results
    console.log('\n🏆 Comparison:');
    const improvement = aiResult.match.confidence - basicResult.match.confidence;
    console.log(
      `   AI vs Basic: ${improvement > 0 ? '+' : ''}${improvement}% confidence improvement`
    );
    console.log(
      `   Time cost: ${aiResult.executionTime - basicResult.executionTime}ms extra for AI`
    );
  } catch (error) {
    console.error('❌ Test failed:', error);
  }

  console.log('\n' + '='.repeat(60));
}

async function testBatchSongs() {
  console.log('\n\n🎼 Testing AI-Enhanced Batch Song Matching\n');
  console.log('='.repeat(60));

  const songs = TERRIBLE_SONGS.slice(0, 5) as DatabaseSong[]; // Test first 5

  console.log(`🚀 Testing ${songs.length} "terrible" database entries:`);
  songs.forEach((song, i) => {
    console.log(`   ${i + 1}. "${song.title}" by "${song.author}"`);
  });

  try {
    console.log('\n🤖 Running AI-Enhanced Batch Search...\n');

    const results = await searchSongsWithAI(
      songs,
      {
        enableAIAnalysis: true,
        maxQueries: 6,
        minConfidenceScore: 60,
        includePartialMatches: true,
      },
      (progress) => {
        const current = progress.current;
        if (current) {
          console.log(
            `📊 [${progress.completed}/${progress.total}] "${current.song.title}" → ${current.match.confidence}% confidence`
          );
        }
      }
    );

    // Generate summary report
    console.log('\n📋 BATCH RESULTS SUMMARY');
    console.log('='.repeat(40));

    const successful = results.filter((r) => r.match.confidence >= 60);
    const partial = results.filter((r) => r.match.confidence >= 30 && r.match.confidence < 60);
    const failed = results.filter((r) => r.match.confidence < 30);

    console.log(`📈 Success Rate: ${Math.round((successful.length / results.length) * 100)}%`);
    console.log(`✅ High confidence (≥60%): ${successful.length} songs`);
    console.log(`⚠️  Partial matches (30-59%): ${partial.length} songs`);
    console.log(`❌ Failed (<30%): ${failed.length} songs`);

    const avgConfidence = results.reduce((sum, r) => sum + r.match.confidence, 0) / results.length;
    const totalTime = results.reduce((sum, r) => sum + r.executionTime, 0);

    console.log(`📊 Average confidence: ${Math.round(avgConfidence)}%`);
    console.log(`⏱️  Total processing time: ${Math.round(totalTime / 1000)}s`);
    console.log(
      `🔍 Average queries per song: ${Math.round(
        results.reduce((sum, r) => sum + r.queriesUsed, 0) / results.length
      )}`
    );

    // Show successful matches
    if (successful.length > 0) {
      console.log('\n🎯 SUCCESSFUL MATCHES:');
      successful.forEach((result, i) => {
        const track = result.match.spotifyTrack!;
        console.log(
          `   ${i + 1}. "${result.song.title}" → "${track.name}" (${result.match.confidence}%)`
        );
        console.log(`      by "${result.song.author}" → "${track.artists[0].name}"`);
      });
    }

    // Show failed matches for analysis
    if (failed.length > 0) {
      console.log('\n❌ FAILED MATCHES (need manual review):');
      failed.forEach((result, i) => {
        console.log(`   ${i + 1}. "${result.song.title}" by "${result.song.author}"`);
        console.log(`      Confidence: ${result.match.confidence}% - ${result.match.reason}`);
      });
    }
  } catch (error) {
    console.error('❌ Batch test failed:', error);
  }

  console.log('\n' + '='.repeat(60));
}

async function main() {
  console.log('🎵 AI-Enhanced Spotify Matching Test Suite');
  console.log('Testing with intentionally "terrible" database entries\n');

  // Test single song matching
  await testSingleSong();

  // Small delay between tests
  await new Promise((resolve) => setTimeout(resolve, 1000));

  // Test batch matching
  await testBatchSongs();

  console.log('\n✅ All tests completed!');
  console.log('\n💡 Key Takeaways:');
  console.log('   • AI analysis helps normalize messy song data');
  console.log('   • Multiple search strategies increase match rates');
  console.log('   • Confidence scoring helps filter reliable matches');
  console.log('   • Fuzzy string matching catches typos and variations');
  console.log('   • Worth the extra processing time for better accuracy!');
}

// Run the test if called directly
if (import.meta.url === `file://${process.argv[1]}`) {
  main().catch(console.error);
}

export { testSingleSong, testBatchSongs, TERRIBLE_SONGS };
