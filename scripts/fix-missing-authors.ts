/**
 * Script to populate missing author fields from Spotify metadata
 *
 * This script:
 * 1. Finds songs with spotify_link_url but missing author
 * 2. Extracts Spotify track ID from the URL
 * 3. Fetches artist name from Spotify API
 * 4. Updates the author field
 */

import { config } from 'dotenv';
import { createClient } from '@supabase/supabase-js';
import type { Database } from '../types/database.types';

// Load environment variables
config({ path: '.env.local' });

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_LOCAL_URL || 'http://127.0.0.1:54321';
const supabaseKey =
  process.env.SUPABASE_LOCAL_SERVICE_ROLE_KEY ||
  process.env.NEXT_PUBLIC_SUPABASE_LOCAL_ANON_KEY ||
  'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZS1kZW1vIiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImV4cCI6MTk4MzgxMjk5Nn0.EGIM96RAZx35lJzdJsyH-qQwv8Hdp7fsn3W0YpN81IU';

console.log('🔧 Connecting to Supabase:', supabaseUrl);
console.log('🔑 Using key type:', supabaseKey.includes('service_role') ? 'SERVICE_ROLE' : 'ANON');

const supabase = createClient<Database>(supabaseUrl, supabaseKey);

async function getSpotifyAccessToken(): Promise<string> {
  const clientId = process.env.SPOTIFY_CLIENT_ID;
  const clientSecret = process.env.SPOTIFY_CLIENT_SECRET;

  if (!clientId || !clientSecret) {
    throw new Error('Spotify credentials not found');
  }

  const response = await fetch('https://accounts.spotify.com/api/token', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/x-www-form-urlencoded',
      Authorization: `Basic ${Buffer.from(`${clientId}:${clientSecret}`).toString('base64')}`,
    },
    body: 'grant_type=client_credentials',
  });

  const data = await response.json();
  return data.access_token;
}

async function getTrackFromSpotify(trackId: string, accessToken: string) {
  const response = await fetch(`https://api.spotify.com/v1/tracks/${trackId}`, {
    headers: {
      Authorization: `Bearer ${accessToken}`,
    },
  });

  return response.json();
}

function extractSpotifyId(url: string): string | null {
  const match = url.match(/track\/([a-zA-Z0-9]+)/);
  return match ? match[1] : null;
}

async function fixMissingAuthors() {
  console.log('🔍 Finding songs with Spotify links but missing authors...\n');

  // Get songs with spotify_link_url but no author (null or empty string)
  const { data: songs, error } = await supabase
    .from('songs')
    .select('id, title, spotify_link_url, author')
    .not('spotify_link_url', 'is', null);

  console.log('📊 Query result:', { songsCount: songs?.length, error: error?.message });

  if (error) {
    console.error('❌ Error fetching songs:', error);
    return;
  }

  console.log(`📋 Total songs with Spotify links: ${songs?.length || 0}`);
  console.log(
    `📋 Sample author values:`,
    songs
      ?.slice(0, 5)
      .map((s) => ({
        title: s.title,
        author: `"${s.author}"`,
        type: typeof s.author,
        isEmpty: !s.author || s.author.trim() === '',
      }))
  );

  // Filter out songs that already have authors
  const songsNeedingAuthors = songs?.filter((s) => !s.author || s.author.trim() === '') || [];

  if (songsNeedingAuthors.length === 0) {
    console.log('✅ No songs found with missing authors!');
    return;
  }

  console.log(`📊 Found ${songsNeedingAuthors.length} songs with missing authors\n`);

  const accessToken = await getSpotifyAccessToken();
  let updated = 0;
  let failed = 0;

  for (const song of songsNeedingAuthors) {
    try {
      const spotifyId = extractSpotifyId(song.spotify_link_url!);
      if (!spotifyId) {
        console.log(`⚠️  Cannot extract Spotify ID from: ${song.spotify_link_url}`);
        failed++;
        continue;
      }

      const track = await getTrackFromSpotify(spotifyId, accessToken);
      const artist = track.artists?.[0]?.name;

      if (!artist) {
        console.log(`⚠️  No artist found for: ${song.title}`);
        failed++;
        continue;
      }

      // Update the song
      const { error: updateError } = await supabase
        .from('songs')
        .update({ author: artist })
        .eq('id', song.id);

      if (updateError) {
        console.log(`❌ Failed to update ${song.title}:`, updateError.message);
        failed++;
      } else {
        console.log(`✅ Updated "${song.title}" -> author: ${artist}`);
        updated++;
      }

      // Rate limiting
      await new Promise((resolve) => setTimeout(resolve, 100));
    } catch (err) {
      console.error(`❌ Error processing ${song.title}:`, err);
      failed++;
    }
  }

  console.log(`\n📊 Summary:`);
  console.log(`   ✅ Updated: ${updated}`);
  console.log(`   ❌ Failed: ${failed}`);
  console.log(`   📝 Total: ${songsNeedingAuthors.length}`);
}

fixMissingAuthors().catch(console.error);
