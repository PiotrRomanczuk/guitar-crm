#!/usr/bin/env node

import { config } from 'dotenv';
config({ path: '.env.local' });

import { createClient } from '@supabase/supabase-js';

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
);

async function listAvailableSongs() {
  const { data: songs } = await supabase
    .from('songs')
    .select('id, title, artist')
    .is('spotify_link_url', null)
    .is('deleted_at', null)
    .limit(20);

  console.log('Songs without Spotify data:');
  songs?.forEach((s) => console.log(`${s.title} by ${s.artist || 'Unknown'}`));
}

listAvailableSongs().catch(console.error);
