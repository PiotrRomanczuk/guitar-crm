#!/usr/bin/env npx tsx

// Load environment variables from .env.local
import { config } from 'dotenv';
import { join } from 'path';

// Load .env.local file
config({ path: join(process.cwd(), '.env.local') });

console.log('🔧 Environment Check');
console.log('===================');
console.log('SPOTIFY_CLIENT_ID:', process.env.SPOTIFY_CLIENT_ID ? 'SET ✅' : 'MISSING ❌');
console.log('SPOTIFY_CLIENT_SECRET:', process.env.SPOTIFY_CLIENT_SECRET ? 'SET ✅' : 'MISSING ❌');

// Test basic Spotify search
import { searchTracks } from '@/lib/spotify';

async function quickTest() {
  try {
    console.log('\n🔍 Testing Spotify search for "Africa Toto"...');
    const result = await searchTracks('Africa Toto');
    
    if (result?.tracks?.items?.length > 0) {
      console.log('✅ SUCCESS! Found:', result.tracks.items[0].name, 'by', result.tracks.items[0].artists[0].name);
    } else {
      console.log('❌ No results found');
      console.log('Full response:', JSON.stringify(result, null, 2));
    }
  } catch (error) {
    console.error('❌ Error:', error.message);
  }
}

quickTest();