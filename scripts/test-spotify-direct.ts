#!/usr/bin/env npx tsx

/**
 * Debug Spotify API search directly using our existing service
 */

import { searchTracks } from '@/lib/spotify';

console.log('🎵 Testing Spotify API Search Directly');
console.log('======================================');

async function testSpotifySearch() {
  try {
    console.log('🔍 Testing simple query: "hello"');

    const results = await searchTracks('hello');

    console.log('Full response structure:');
    console.log(JSON.stringify(results, null, 2));

    if (!results) {
      console.log('❌ Results is null/undefined');
      return;
    }

    if (results.error) {
      console.log('❌ Spotify API Error:', results.error);
      return;
    }

    if (!results.tracks) {
      console.log('❌ No tracks property in response');
      return;
    }

    console.log(`✅ Found ${results.tracks.items?.length || 0} tracks`);

    if (results.tracks.items?.length > 0) {
      results.tracks.items.slice(0, 3).forEach((track: any, index: number) => {
        console.log(`   ${index + 1}. "${track.name}" by "${track.artists[0]?.name}"`);
      });
    }
  } catch (error) {
    console.error('❌ Caught error:', error);
    console.error('Error details:', error.message);
    console.error('Stack trace:', error.stack);
  }
}

testSpotifySearch();

testSpotifySearch();
