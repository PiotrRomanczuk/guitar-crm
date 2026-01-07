#!/usr/bin/env npx tsx

/**
 * Debug Spotify authentication specifically
 */

// Load environment variables from .env.local
import { config } from 'dotenv';
import { join } from 'path';

// Load .env.local file
config({ path: join(process.cwd(), '.env.local') });

console.log('🎵 Testing Spotify Authentication');
console.log('=================================');

async function testSpotifyAuth() {
  try {
    const client_id = process.env.SPOTIFY_CLIENT_ID;
    const client_secret = process.env.SPOTIFY_CLIENT_SECRET;

    console.log('Client ID:', client_id ? `${client_id.slice(0, 8)}...` : 'MISSING');
    console.log('Client Secret:', client_secret ? `${client_secret.slice(0, 8)}...` : 'MISSING');

    if (!client_id || !client_secret) {
      console.log('❌ Missing Spotify credentials in environment');
      return;
    }

    const basic = Buffer.from(`${client_id}:${client_secret}`).toString('base64');
    console.log('Basic auth header:', `Basic ${basic.slice(0, 20)}...`);

    console.log('\n🔑 Requesting access token...');

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

    console.log('Response status:', response.status);
    console.log('Response headers:', Object.fromEntries(response.headers.entries()));

    const data = await response.json();
    console.log('Response data:', data);

    if (data.access_token) {
      console.log('✅ Successfully got access token');

      // Test a simple search
      console.log('\n🔍 Testing search with new token...');

      const searchResponse = await fetch(
        'https://api.spotify.com/v1/search?q=hello&type=track&limit=3',
        {
          headers: {
            Authorization: `Bearer ${data.access_token}`,
          },
        }
      );

      console.log('Search response status:', searchResponse.status);

      if (searchResponse.ok) {
        const searchData = await searchResponse.json();
        console.log('✅ Search successful!');
        console.log(`Found ${searchData.tracks.items.length} tracks`);

        if (searchData.tracks.items.length > 0) {
          console.log('First result:', {
            name: searchData.tracks.items[0].name,
            artist: searchData.tracks.items[0].artists[0].name,
          });
        }
      } else {
        const errorData = await searchResponse.json();
        console.log('❌ Search failed:', errorData);
      }
    } else {
      console.log('❌ Failed to get access token:', data);
    }
  } catch (error) {
    console.error('❌ Error:', error);
  }
}

testSpotifyAuth();
