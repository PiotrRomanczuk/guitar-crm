#!/usr/bin/env npx tsx

/**
 * Process all songs with AI-enhanced Spotify matching
 */

// Load environment variables from .env.local
import { config } from 'dotenv';
import { join } from 'path';

// Load .env.local file
config({ path: join(process.cwd(), '.env.local') });

import { createClient } from '@supabase/supabase-js';
import type { Database } from '../database.types';
import { searchSongWithAI } from '@/lib/services/enhanced-spotify-search';

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_LOCAL_URL || 'http://127.0.0.1:54321';
const supabaseServiceKey = process.env.SUPABASE_LOCAL_SERVICE_ROLE_KEY || 
  'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZS1kZW1vIiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImV4cCI6MTk4MzgxMjk5Nn0.EGIM96RAZx35lJzdJsyH-qQwv8Hdp7fsn3W0YpN81IU';

const supabase = createClient<Database>(supabaseUrl, supabaseServiceKey);

console.log('🎵 AI-Enhanced Spotify Sync for All Songs');
console.log('==========================================\n');

async function syncAllSongs() {
  try {
    // Get all songs that don't have Spotify data
    console.log('🔍 Finding songs without Spotify data...');
    
    const { data: songs, error } = await supabase
      .from('songs')
      .select('*')
      .is('spotify_link_url', null)
      .order('title');

    if (error) {
      console.error('❌ Error fetching songs:', error);
      return;
    }

    if (!songs || songs.length === 0) {
      console.log('✅ No songs need Spotify data - all songs are already linked!');
      return;
    }

    console.log(`📊 Found ${songs.length} songs to process`);
    console.log('⚙️  Using 85% confidence threshold (auto-update), 60-84% (manual review), <60% (skip)\n');

    let processed = 0;
    let autoUpdated = 0;
    let pendingReview = 0;
    let skipped = 0;
    let errors = 0;

    for (const song of songs) {
      processed++;
      console.log(`\n[${processed}/${songs.length}] Processing: "${song.title}" by "${song.author || 'Unknown'}"`);

      try {
        // Skip songs without title
        if (!song.title) {
          console.log('   ⏭️  Skipping - no title');
          skipped++;
          continue;
        }

        // Use AI-enhanced search
        const result = await searchSongWithAI(song, {
          minConfidenceScore: 60,
          enableAIAnalysis: true,
          maxQueries: 6
        });

        const confidence = result.match.confidence;
        console.log(`   ✨ Confidence: ${confidence}% | Match: ${result.match.found ? result.match.track?.name : 'None'}`);

        if (confidence >= 85 && result.match.found && result.match.track) {
          // Auto-update the song
          const { error: updateError } = await supabase
            .from('songs')
            .update({
              spotify_link_url: result.match.track.external_urls.spotify,
              updated_at: new Date().toISOString(),
            })
            .eq('id', song.id);

          if (updateError) {
            console.log('   ❌ Error updating song:', updateError.message);
            errors++;
          } else {
            console.log('   🟢 AUTO-UPDATED ✅');
            autoUpdated++;
          }

        } else if (confidence >= 60 && result.match.found && result.match.track) {
          // Save for manual review
          const pendingMatch = {
            song_id: song.id,
            spotify_track_id: result.match.track.id,
            spotify_track_name: result.match.track.name,
            spotify_artist_name: result.match.track.artists[0]?.name || 'Unknown',
            spotify_album_name: result.match.track.album?.name,
            spotify_url: result.match.track.external_urls.spotify,
            spotify_preview_url: result.match.track.preview_url,
            spotify_cover_image_url: result.match.track.album?.images?.[0]?.url,
            spotify_duration_ms: result.match.track.duration_ms,
            spotify_release_date: result.match.track.album?.release_date,
            spotify_popularity: result.match.track.popularity,
            confidence_score: Math.round(confidence),
            search_query: `"${song.title}" "${song.author || ''}"`.trim(),
            match_reason: result.match.reasoning,
            status: 'pending' as const,
          };

          const { error: insertError } = await supabase
            .from('spotify_matches')
            .insert(pendingMatch);

          if (insertError) {
            console.log('   ❌ Error saving for review:', insertError.message);
            errors++;
          } else {
            console.log('   🟡 SAVED FOR MANUAL REVIEW 📋');
            pendingReview++;
          }

        } else {
          console.log('   🔴 SKIPPED (low confidence)');
          skipped++;
        }

        // Small delay to be respectful to APIs
        await new Promise(resolve => setTimeout(resolve, 500));

      } catch (error) {
        console.log('   ❌ Error processing song:', error.message);
        errors++;
      }
    }

    // Final summary
    console.log('\n🎯 PROCESSING COMPLETE!');
    console.log('========================');
    console.log(`📊 Total Processed: ${processed}`);
    console.log(`🟢 Auto-Updated (≥85%): ${autoUpdated}`);
    console.log(`🟡 Pending Review (60-84%): ${pendingReview}`);
    console.log(`🔴 Skipped (<60%): ${skipped}`);
    console.log(`❌ Errors: ${errors}`);
    
    if (pendingReview > 0) {
      console.log(`\n💡 ${pendingReview} songs need manual review. Check the admin dashboard to approve/reject matches.`);
    }

  } catch (error) {
    console.error('❌ Fatal error:', error);
  }
}

syncAllSongs();