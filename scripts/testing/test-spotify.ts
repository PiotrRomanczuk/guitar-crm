#!/usr/bin/env tsx

/**
 * Consolidated Spotify Testing Script
 * Tests Spotify API authentication and search functionality
 *
 * Usage:
 *   npx tsx scripts/testing/test-spotify.ts         # Run all tests
 *   npx tsx scripts/testing/test-spotify.ts auth    # Test authentication only
 *   npx tsx scripts/testing/test-spotify.ts search  # Test search only
 */

import { config } from 'dotenv';
import { join } from 'path';

// Load environment variables
config({ path: join(process.cwd(), '.env.local') });

const TEST_TYPES = ['auth', 'search', 'all'] as const;
type TestType = (typeof TEST_TYPES)[number];

async function testSpotifyAuth(): Promise<boolean> {
  console.log('\n🔑 Testing Spotify Authentication...');
  console.log('=====================================');

  const client_id = process.env.SPOTIFY_CLIENT_ID;
  const client_secret = process.env.SPOTIFY_CLIENT_SECRET;

  console.log('Client ID:', client_id ? `${client_id.slice(0, 8)}...` : 'MISSING');
  console.log('Client Secret:', client_secret ? `${client_secret.slice(0, 8)}...` : 'MISSING');

  if (!client_id || !client_secret) {
    console.error('❌ Missing Spotify credentials in environment');
    return false;
  }

  try {
    const basic = Buffer.from(`${client_id}:${client_secret}`).toString('base64');

    const response = await fetch('https://accounts.spotify.com/api/token', {
      method: 'POST',
      headers: {
        Authorization: `Basic ${basic}`,
        'Content-Type': 'application/x-www-form-urlencoded',
      },
      body: new URLSearchParams({
        grant_type: 'client_credentials',
      }),
    });

    const data = await response.json();

    if (data.access_token) {
      console.log('✅ Successfully obtained access token');
      console.log(`   Token type: ${data.token_type}`);
      console.log(`   Expires in: ${data.expires_in}s`);
      return true;
    } else {
      console.error('❌ Failed to get access token:', data);
      return false;
    }
  } catch (error) {
    console.error('❌ Authentication error:', error);
    return false;
  }
}

async function testSpotifySearch(): Promise<boolean> {
  console.log('\n🔍 Testing Spotify Search...');
  console.log('============================');

  try {
    const { searchTracks } = await import('../../lib/spotify');

    // Test with a well-known song
    const testQueries = ['Africa Toto', 'Wonderwall Oasis', 'Hello Adele'];

    for (const query of testQueries) {
      console.log(`\nSearching for: "${query}"`);

      const result = await searchTracks(query);

      if (result?.tracks?.items?.length > 0) {
        const track = result.tracks.items[0];
        console.log(`  ✅ Found: "${track.name}" by ${track.artists[0]?.name}`);
      } else if (result?.error) {
        console.log(`  ❌ Error: ${result.error}`);
        return false;
      } else {
        console.log('  ⚠️ No results found');
      }
    }

    console.log('\n✅ Search tests completed successfully');
    return true;
  } catch (error) {
    console.error('❌ Search error:', error);
    return false;
  }
}

async function main() {
  console.log('🎵 SPOTIFY API TESTING UTILITY');
  console.log('==============================');

  const testType = (process.argv[2] as TestType) || 'all';

  if (!TEST_TYPES.includes(testType)) {
    console.error(`❌ Unknown test type: ${testType}`);
    console.log(`Available types: ${TEST_TYPES.join(', ')}`);
    process.exit(1);
  }

  let success = true;

  if (testType === 'auth' || testType === 'all') {
    const authSuccess = await testSpotifyAuth();
    success = success && authSuccess;
  }

  if (testType === 'search' || testType === 'all') {
    const searchSuccess = await testSpotifySearch();
    success = success && searchSuccess;
  }

  if (success) {
    console.log('\n✅ All Spotify tests passed!');
  } else {
    console.log('\n❌ Some tests failed');
    process.exit(1);
  }
}

main().catch(console.error);
