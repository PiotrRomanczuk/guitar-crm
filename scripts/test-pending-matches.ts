#!/usr/bin/env node

import { config } from 'dotenv';
config({ path: '.env.local' });

import { createClient } from '@supabase/supabase-js';
import { searchSongWithAI } from '../lib/services/enhanced-spotify-search';

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
);

async function testPendingMatches() {
  console.log('🎵 Testing Pending Matches Logic');
  console.log('================================');

  // Find a song with no artist (should get lower confidence)
  const { data: testSong, error } = await supabase
    .from('songs')
    .select('*')
    .is('spotify_link_url', null)
    .is('deleted_at', null)
    .eq('title', 'Are you gonna be my girl')
    .single();

  if (error || !testSong) {
    console.log('❌ Could not find test song');
    return;
  }

  console.log(`🔍 Testing with: "${testSong.title}" by "${testSong.artist || 'Unknown'}"`);

  // Search for this song
  const result = await searchSongWithAI(testSong, {
    maxQueries: 4,
    minConfidenceScore: 20,
    includePartialMatches: true,
    enableAIAnalysis: true,
  });

  console.log(`\n📊 Search Result:`);
  console.log(`   Confidence: ${result.confidence}%`);
  console.log(`   Found: ${result.found ? 'Yes' : 'No'}`);
  
  if (result.track) {
    console.log(`   Match: "${result.track.name}" by "${result.track.artists[0]?.name}"`);
  }

  // Test the logic
  if (result.confidence >= 85 && result.track) {
    console.log(`\n✅ This would be AUTO-UPDATED (≥85% confidence)`);
  } else if (result.confidence >= 20 && result.track) {
    console.log(`\n📋 This would be saved for MANUAL REVIEW (20-84% confidence)`);
    
    // Test saving to pending matches
    const track = result.track;
    const { error: insertError } = await supabase.from('spotify_matches').insert({
      song_id: testSong.id,
      spotify_track_id: track.id,
      confidence_score: result.confidence,
      search_query: `${testSong.title} ${testSong.artist || ''}`,
      match_reason: result.reason || 'AI-powered fuzzy match',
      spotify_data: {
        name: track.name,
        artist: track.artists[0]?.name,
        album: track.album.name,
        external_urls: track.external_urls,
        duration_ms: track.duration_ms,
        release_date: track.album.release_date,
        images: track.album.images,
        popularity: track.popularity,
        preview_url: track.preview_url,
      },
      status: 'pending',
    });

    if (insertError) {
      console.log(`❌ Error saving to pending matches: ${insertError.message}`);
    } else {
      console.log(`✅ Successfully saved to pending matches table!`);
    }
  } else {
    console.log(`\n⏭️ This would be SKIPPED (<20% confidence)`);
  }
}

testPendingMatches().catch(console.error);