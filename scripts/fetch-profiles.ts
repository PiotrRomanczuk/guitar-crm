#!/usr/bin/env tsx

/**
 * Fetch all profiles from PostgreSQL database
 * Usage: npx tsx scripts/fetch-profiles.ts
 */

import { createClient } from '@supabase/supabase-js';
import { config } from 'dotenv';

// Load environment variables
config({ path: '.env.local' });

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

if (!supabaseUrl || !supabaseServiceKey) {
  console.error('❌ Missing required environment variables:');
  console.error('   NEXT_PUBLIC_SUPABASE_URL:', supabaseUrl ? '✅' : '❌');
  console.error('   SUPABASE_SERVICE_ROLE_KEY:', supabaseServiceKey ? '✅' : '❌');
  process.exit(1);
}

const supabase = createClient(supabaseUrl, supabaseServiceKey);

async function fetchAllProfiles() {
  try {
    console.log('🔍 Fetching all profiles from PostgreSQL...\n');

    const { data: profiles, error } = await supabase
      .from('profiles')
      .select('*')
      .order('created_at', { ascending: false });

    if (error) {
      console.error('❌ Error fetching profiles:', error.message);
      process.exit(1);
    }

    console.log(`✅ Found ${profiles?.length || 0} profiles:\n`);

    if (profiles && profiles.length > 0) {
      profiles.forEach((profile, index) => {
        console.log(`Profile ${index + 1}:`);
        console.log('  ID:', profile.id);
        console.log('  Display Name:', profile.display_name || 'N/A');
        console.log('  Avatar URL:', profile.avatar_url || 'N/A');
        console.log('  Bio:', profile.bio || 'N/A');
        console.log('  Created At:', profile.created_at);
        console.log('  Updated At:', profile.updated_at);
        console.log('---');
      });

      // Output as JSON for easy parsing
      console.log('\n📄 JSON Output:');
      console.log(JSON.stringify(profiles, null, 2));
    } else {
      console.log('ℹ️  No profiles found in the database.');
    }
  } catch (err) {
    console.error('❌ Unexpected error:', err);
    process.exit(1);
  }
}

fetchAllProfiles();
