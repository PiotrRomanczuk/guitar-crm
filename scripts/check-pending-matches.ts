#!/usr/bin/env node

import { config } from 'dotenv';
config({ path: '.env.local' });

import { createClient } from '@supabase/supabase-js';

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
);

async function checkPendingMatches() {
  const { data: pending, count } = await supabase
    .from('spotify_matches')
    .select('*, songs(title, artist)', { count: 'exact' })
    .eq('status', 'pending')
    .order('confidence_score', { ascending: false });

  console.log(`📋 Found ${count || 0} pending matches for manual review:`);
  pending?.forEach((match) => {
    const song = match.songs as any;
    const spotify = match.spotify_data as any;
    console.log(
      `  ${match.confidence_score}% - "${song.title}" → "${spotify.name}" by ${spotify.artist}`
    );
  });

  // Also check total songs with Spotify data
  const { count: totalWithSpotify } = await supabase
    .from('songs')
    .select('id', { count: 'exact' })
    .not('spotify_link_url', 'is', null)
    .is('deleted_at', null);

  const { count: totalSongs } = await supabase
    .from('songs')
    .select('id', { count: 'exact' })
    .is('deleted_at', null);

  console.log(`\n📊 Overall Progress:`);
  console.log(`   Total songs: ${totalSongs || 0}`);
  console.log(`   With Spotify data: ${totalWithSpotify || 0}`);
  console.log(
    `   Success rate: ${
      totalSongs ? (((totalWithSpotify || 0) / totalSongs) * 100).toFixed(1) : 0
    }%`
  );
}

checkPendingMatches().catch(console.error);
