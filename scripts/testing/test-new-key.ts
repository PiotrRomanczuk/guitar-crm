import { createClient } from '@supabase/supabase-js';

const url = 'http://127.0.0.1:54321';
const key = 'sb_publishable_ACJWlzQHlZjBrEguHvfOxg_3BJgxAaH';

console.log('Testing connection with key:', key);

const supabase = createClient(url, key);

async function test() {
  try {
    const { data, error } = await supabase.from('profiles').select('count').limit(1).maybeSingle();
    if (error) {
      console.error('Error:', error);
    } else {
      console.log('Success:', data);
    }
  } catch (e) {
    console.error('Exception:', e);
  }
}

test();
