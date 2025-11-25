const { createClient } = require('@supabase/supabase-js');
const path = require('path');
require('dotenv').config({ path: path.resolve(process.cwd(), '.env.local') });

const SUPABASE_URL = process.env.NEXT_PUBLIC_SUPABASE_URL;
const SERVICE_ROLE_KEY = process.env.SUPABASE_SERVICE_ROLE_KEY;

const supabase = createClient(SUPABASE_URL, SERVICE_ROLE_KEY);

async function checkColumns() {
  const tables = ['lessons', 'assignments', 'songs'];

  for (const table of tables) {
    console.log(`\n--- Table: ${table} ---`);
    // Try to insert an invalid column to get a helpful error message listing valid columns
    // OR just select * limit 0 and look at the error or result?
    // Select * limit 0 won't give columns in data if empty.

    // We can query the RPC 'get_columns' if it existed, but it doesn't.
    // We can try to insert a row with a random column name.

    const { error } = await supabase.from(table).insert({ non_existent_column_xyz: 'test' });
    if (error) {
      console.log('Error:', error.message);
      console.log('Hint:', error.hint);
      console.log('Details:', error.details);
    } else {
      console.log('Unexpected success (should have failed)');
    }
  }
}

checkColumns();
