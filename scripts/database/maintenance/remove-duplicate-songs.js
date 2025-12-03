const { createClient } = require('@supabase/supabase-js');
const path = require('path');
require('dotenv').config({ path: path.resolve(process.cwd(), '.env.local') });

const SUPABASE_URL = process.env.NEXT_PUBLIC_SUPABASE_URL || process.env.SUPABASE_URL;
const SERVICE_ROLE_KEY =
  process.env.SUPABASE_SERVICE_ROLE_KEY || process.env.NEXT_PUBLIC_SUPABASE_SERVICE_ROLE_KEY;

if (!SUPABASE_URL || !SERVICE_ROLE_KEY) {
  console.error('Missing Supabase env variables.');
  process.exit(1);
}

const supabase = createClient(SUPABASE_URL, SERVICE_ROLE_KEY);

async function removeDuplicateSongs() {
  console.log('🔍 Finding duplicate songs...');

  // 1. Fetch all songs
  const { data: songs, error } = await supabase
    .from('songs')
    .select('id, title, created_at')
    .order('created_at', { ascending: true });

  if (error) {
    console.error('Error fetching songs:', error);
    return;
  }

  console.log(`Total songs found: ${songs.length}`);

  // 2. Group by title
  const songsByTitle = {};
  songs.forEach((song) => {
    const title = song.title.trim(); // Normalize title
    if (!songsByTitle[title]) {
      songsByTitle[title] = [];
    }
    songsByTitle[title].push(song);
  });

  // 3. Identify duplicates
  let duplicatesCount = 0;
  let deletedCount = 0;
  const idsToDelete = [];

  for (const title in songsByTitle) {
    const group = songsByTitle[title];
    if (group.length > 1) {
      console.log(`Found ${group.length} copies of "${title}"`);
      duplicatesCount += group.length - 1;

      // Keep the first one (oldest created_at due to sort)
      const keep = group[0];
      const remove = group.slice(1);

      console.log(`  Keeping ID: ${keep.id}`);
      remove.forEach((s) => {
        console.log(`  Marking for deletion ID: ${s.id}`);
        idsToDelete.push(s.id);
      });
    }
  }

  if (idsToDelete.length === 0) {
    console.log('✅ No duplicates found.');
    return;
  }

  console.log(`\n🗑️ Deleting ${idsToDelete.length} duplicate songs...`);

  // 4. Delete duplicates
  // We delete one by one or in batches to handle potential errors gracefully
  for (const id of idsToDelete) {
    const { error: deleteError } = await supabase.from('songs').delete().eq('id', id);

    if (deleteError) {
      console.error(`Failed to delete song ${id}:`, deleteError.message);
      // If FK constraint fails, we might need to reassign lesson_songs
      // For now, we just log it.
    } else {
      deletedCount++;
    }
  }

  console.log(`\n✨ Cleanup complete.`);
  console.log(`Duplicates found: ${duplicatesCount}`);
  console.log(`Successfully deleted: ${deletedCount}`);
}

removeDuplicateSongs().catch(console.error);
