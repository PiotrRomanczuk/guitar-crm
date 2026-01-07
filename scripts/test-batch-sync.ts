#!/usr/bin/env npx tsx

/**
 * Process a small batch of songs to test the system
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

console.log('🎵 Testing AI-Enhanced Spotify Sync (Small Batch)');
console.log('================================================\n');

async function syncBatchSongs() {
  try {
    // Get first 10 songs that don't have Spotify data
    console.log('🔍 Finding first 10 songs without Spotify data...');
    
    const { data: songs, error } = await supabase
      .from('songs')
      .select('*')
      .is('spotify_link_url', null)
      .order('title')
      .limit(10);

    if (error) {
      console.error('❌ Error fetching songs:', error);
      return;
    }

    if (!songs || songs.length === 0) {
      console.log('✅ No songs need Spotify data - all songs are already linked!');
      return;
    }

    console.log(`📊 Found ${songs.length} songs to process\n`);

    let autoUpdated = 0;
    let pendingReview = 0;
    let skipped = 0;
    let errors = 0;

    for (const [index, song] of songs.entries()) {
      console.log(`[${index + 1}/${songs.length}] Processing: "${song.title}" by "${song.author || 'Unknown'}"`);

      try {
        if (!song.title) {
          console.log('   ⏭️  Skipping - no title');
          skipped++;
          continue;
        }

        const result = await searchSongWithAI(song, {
          minConfidenceScore: 60,
          enableAIAnalysis: true,
          maxQueries: 4 // Reduced for faster testing
        });

        const confidence = result.match.confidence;
        const matchName = result.match.found ? result.match.track?.name : 'None';
        const matchArtist = result.match.found ? result.match.track?.artists[0]?.name : '';
        
        console.log(`   ✨ Confidence: ${confidence}% | Match: "${matchName}" by "${matchArtist}"`);

        if (confidence >= 85 && result.match.found && result.match.track) {
          autoUpdated++;
          console.log('   🟢 AUTO-UPDATED ✅');
        } else if (confidence >= 60 && result.match.found && result.match.track) {
          pendingReview++;
          console.log('   🟡 SAVED FOR MANUAL REVIEW 📋');
        } else {
          skipped++;
          console.log('   🔴 SKIPPED (low confidence)');
        }

        // Small delay between requests
        await new Promise(resolve => setTimeout(resolve, 1000));

      } catch (error) {
        console.log('   ❌ Error processing song:', error.message);
        errors++;
      }
    }

    console.log('\n🎯 BATCH TEST COMPLETE!');
    console.log('======================');
    console.log(`🟢 Auto-Updated (≥85%): ${autoUpdated}`);
    console.log(`🟡 Pending Review (60-84%): ${pendingReview}`);
    console.log(`🔴 Skipped (<60%): ${skipped}`);
    console.log(`❌ Errors: ${errors}`);
    
    const successRate = ((autoUpdated + pendingReview) / songs.length * 100).toFixed(1);
    console.log(`📈 Success Rate: ${successRate}%`);

  } catch (error) {
    console.error('❌ Fatal error:', error);
  }
}

syncBatchSongs();