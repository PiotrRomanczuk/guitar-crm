#!/usr/bin/env npx tsx

/**
 * Simple API test for Spotify sync without authentication
 */

console.log('🎵 Testing Spotify Sync API Directly');
console.log('====================================');

async function testSpotifySync() {
  try {
    // Test with a few songs and basic parameters
    const response = await fetch(
      'http://localhost:3000/api/spotify/sync?limit=3&ai=false&minConfidence=85',
      {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          // Skip authentication for testing
          'X-Test-Mode': 'true',
        },
      }
    );

    console.log('Status:', response.status);
    console.log('Headers:', Object.fromEntries(response.headers.entries()));

    if (response.ok) {
      const data = await response.json();
      console.log('✅ Success:', JSON.stringify(data, null, 2));
    } else {
      const error = await response.text();
      console.log('❌ Error:', error);
    }
  } catch (error) {
    console.error('❌ Network error:', error);
  }
}

testSpotifySync();
