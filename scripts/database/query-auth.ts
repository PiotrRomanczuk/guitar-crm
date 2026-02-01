import { createClient } from '@supabase/supabase-js';
import { config } from 'dotenv';
import { join } from 'path';

config({ path: join(process.cwd(), '.env.local') });

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL || '',
  process.env.SUPABASE_SERVICE_ROLE_KEY || ''
);

async function main() {
  try {
    // Query auth.users table for p.romanczuk@gmail.com
    const { data, error } = await supabase
      .from('auth.users')
      .select('id, email, email_confirmed_at, raw_app_meta_data, raw_user_meta_data')
      .eq('email', 'p.romanczuk@gmail.com');

    if (error) {
      console.error('Error:', error);
      return;
    }

    console.log('👤 AUTH USER (p.romanczuk@gmail.com)');
    console.log('===================================\n');
    console.log(JSON.stringify(data, null, 2));

    // Also query identities
    if (data && data.length > 0) {
      const userId = data[0].id;
      console.log('\n🔗 IDENTITIES FOR THIS USER');
      console.log('============================\n');

      const { data: identities, error: identError } = await supabase
        .from('auth.identities')
        .select('*')
        .eq('user_id', userId);

      if (identError) {
        console.error('Error fetching identities:', identError);
      } else {
        console.log(JSON.stringify(identities, null, 2));
      }
    }
  } catch (err) {
    console.error('Error:', err);
  }
}

main();
