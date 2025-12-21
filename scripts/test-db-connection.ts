
import { createClient } from '@supabase/supabase-js';
import { getSupabaseConfig } from '../lib/supabase/config';
import * as dotenv from 'dotenv';

// Load environment variables from .env.local
dotenv.config({ path: '.env.local' });

async function testConnection() {
  console.log('Testing Supabase Connection...');

  try {
    const config = getSupabaseConfig();
    console.log('Config used:', {
      url: config.url,
      isLocal: config.isLocal
    });

    const supabase = createClient(config.url, config.anonKey);

    const { data, error } = await supabase.from('profiles').select('count').limit(1).single();

    if (error) {
      console.error('Connection failed:', error.message);
    } else {
      console.log('Connection successful! Data received.');
    }

  } catch (err) {
    console.error('Error during test:', err);
  }
}

testConnection();
