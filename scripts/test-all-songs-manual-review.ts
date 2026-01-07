#!/usr/bin/env node

import { config } from 'dotenv';
config({ path: '.env.local' });

import { createClient } from '@supabase/supabase-js';
import { searchSongsWithAI } from '../lib/services/enhanced-spotify-search';
import type { Database } from '../database.types';

type DatabaseSong = Database['public']['Tables']['songs']['Row'];

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
);

async function testAllSongsSync() {
  console.log('🎵 Testing AI-Enhanced Spotify Sync (All Songs with Manual Review)');
  console.log('=================================================================');

  // Find all songs without Spotify data
  console.log('🔍 Finding songs without Spotify data...');
  
  const { data: songs, error: songsError } = await supabase
    .from('songs')
    .select('*')
    .is('spotify_link_url', null)
    .is('deleted_at', null)
    .order('title');

  if (songsError) {
    console.error('❌ Error fetching songs:', songsError);
    return;
  }

  if (!songs || songs.length === 0) {
    console.log('✅ All songs already have Spotify data!');
    return;
  }

  console.log(`📊 Found ${songs.length} songs to process`);

  const results = {
    autoUpdated: 0,
    pendingReview: 0,
    skipped: 0,
    errors: 0,
  };

  // Process all songs
  const searchResults = await searchSongsWithAI(
    songs as DatabaseSong[],
    {
      maxQueries: 8,
      minConfidenceScore: 20, // Lower threshold to catch more matches
      includePartialMatches: true,
      enableAIAnalysis: true,
    },
    // Progress callback
    (progress) => {
      console.log(`📊 Progress: ${progress.completed}/${progress.total} songs processed`);
    }
  );

  // Process results
  for (const searchResult of searchResults) {
    const { song, match } = searchResult;

    try {
      if (match.confidence >= 85 && match.spotifyTrack) {
        // High confidence match (85%+) - update the song directly
        const track = match.spotifyTrack;

        const updateData: {
          spotify_link_url: string;
          duration_ms: number;
          release_year: number | null;
          cover_image_url?: string;
          updated_at: string;
        } = {
          spotify_link_url: track.external_urls.spotify,
          duration_ms: track.duration_ms,
          release_year: track.album.release_date
            ? parseInt(track.album.release_date.split('-')[0])
            : null,
          updated_at: new Date().toISOString(),
        };

        // Set cover image
        const imageUrl = track.album.images[0]?.url;
        if (imageUrl) {
          updateData.cover_image_url = imageUrl;
        }

        const { error: updateError } = await supabase
          .from('songs')
          .update(updateData)
          .eq('id', song.id);

        if (updateError) {
          results.errors++;
          console.error(`❌ Update failed for "${song.title}":`, updateError.message);
        } else {
          results.autoUpdated++;
          console.log(
            `✅ AUTO-UPDATED: "${song.title}" → "${track.name}" (${match.confidence}%)`
          );
        }
      } else if (match.confidence >= 20 && match.spotifyTrack) {
        // Any reasonable match (20%+) - store for manual review
        const track = match.spotifyTrack;

        // First, check if we already have a pending match for this song
        const { data: existingMatch } = await supabase
          .from('spotify_matches')
          .select('id')
          .eq('song_id', song.id)
          .eq('status', 'pending')
          .single();

        if (!existingMatch) {
          // Store the match for manual review
          const { error: insertError } = await supabase.from('spotify_matches').insert({
            song_id: song.id,
            spotify_track_id: track.id,
            confidence_score: match.confidence,
            search_query: match.searchQuery || `${song.title} ${song.artist}`,
            match_reason: match.reason || 'AI-powered fuzzy match',
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
            results.errors++;
            console.error(
              `❌ Failed to store pending match for "${song.title}":`,
              insertError.message
            );
          } else {
            results.pendingReview++;
            console.log(
              `📋 PENDING REVIEW: "${song.title}" → "${track.name}" (${match.confidence}%)`
            );
          }
        } else {
          results.pendingReview++;
          console.log(
            `📋 Already pending: "${song.title}" (${match.confidence}%)`
          );
        }
      } else {
        // Very low confidence or no match
        results.skipped++;
        console.log(
          `⏭️ SKIPPED: "${song.title}" (${match.confidence}% confidence): ${match.reason}`
        );
      }
    } catch (e: unknown) {
      const errorMessage = e instanceof Error ? e.message : 'Unknown error';
      results.errors++;
      console.error(`❌ Processing error for "${song.title}":`, errorMessage);
    }
  }

  console.log('\n🎯 ALL SONGS SYNC COMPLETE!');
  console.log('============================');
  console.log(`🟢 Auto-Updated (≥85%): ${results.autoUpdated}`);
  console.log(`🟡 Pending Manual Review (20-84%): ${results.pendingReview}`);
  console.log(`🔴 Skipped (<20%): ${results.skipped}`);
  console.log(`❌ Errors: ${results.errors}`);
  console.log(`📈 Success Rate: ${((results.autoUpdated + results.pendingReview) / songs.length * 100).toFixed(1)}%`);
  
  if (results.pendingReview > 0) {
    console.log(`\n📋 You now have ${results.pendingReview} matches waiting for manual review in the dashboard!`);
  }
}

testAllSongsSync().catch(console.error);