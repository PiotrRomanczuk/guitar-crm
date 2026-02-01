import { createClient } from '@supabase/supabase-js';

/**
 * Test Data Cleanup Helper
 *
 * Removes test data created during E2E tests to prevent database pollution.
 * Targets data with specific test patterns in titles/names/artists.
 */

// Test patterns to identify test data
const TEST_PATTERNS = {
  songs: {
    titles: [
      /^E2E Song \d+/,
      /^E2E Edit Test \d+/,
      /^Teacher Song \d+/,
      /EDITED$/,
    ],
    artists: [
      'E2E Test Artist',
      'Teacher Test Artist',
    ],
  },
  lessons: {
    titles: [
      /^E2E Lesson \d+/,
      /^Teacher Lesson \d+/,
      /^Test Lesson \d+/,
    ],
  },
  assignments: {
    titles: [
      /^E2E Assignment \d+/,
      /^Teacher Assignment \d+/,
      /^Test Assignment \d+/,
    ],
  },
};

/**
 * Get Supabase admin client for cleanup operations
 */
function getSupabaseClient() {
  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_LOCAL_URL || 'http://127.0.0.1:54321';
  const supabaseKey = process.env.NEXT_PUBLIC_SUPABASE_LOCAL_ANON_KEY || process.env.SUPABASE_SERVICE_ROLE_KEY;

  if (!supabaseKey) {
    throw new Error('Missing Supabase credentials for cleanup');
  }

  return createClient(supabaseUrl, supabaseKey);
}

/**
 * Check if a string matches any of the test patterns
 */
function matchesPattern(value: string | null, patterns: (RegExp | string)[]): boolean {
  if (!value) return false;

  return patterns.some(pattern => {
    if (typeof pattern === 'string') {
      return value === pattern;
    }
    return pattern.test(value);
  });
}

/**
 * Delete test songs from the database
 */
export async function cleanupTestSongs(): Promise<{ deleted: number; errors: any[] }> {
  const supabase = getSupabaseClient();
  let deleted = 0;
  const errors: any[] = [];

  try {
    // Fetch all songs
    const { data: songs, error: fetchError } = await supabase
      .from('songs')
      .select('id, title, author');

    if (fetchError) {
      console.error('Error fetching songs for cleanup:', fetchError);
      errors.push(fetchError);
      return { deleted, errors };
    }

    if (!songs || songs.length === 0) {
      console.log('No songs found for cleanup');
      return { deleted, errors };
    }

    // Filter songs that match test patterns
    const testSongs = songs.filter(song => {
      const titleMatches = matchesPattern(song.title, TEST_PATTERNS.songs.titles);
      const artistMatches = matchesPattern(song.author, TEST_PATTERNS.songs.artists);
      return titleMatches || artistMatches;
    });

    console.log(`Found ${testSongs.length} test songs to delete`);

    // Delete test songs
    for (const song of testSongs) {
      const { error: deleteError } = await supabase
        .from('songs')
        .delete()
        .eq('id', song.id);

      if (deleteError) {
        console.error(`Error deleting song ${song.id}:`, deleteError);
        errors.push({ song, error: deleteError });
      } else {
        deleted++;
        console.log(`Deleted test song: ${song.title}`);
      }
    }

    return { deleted, errors };
  } catch (error) {
    console.error('Unexpected error during song cleanup:', error);
    errors.push(error);
    return { deleted, errors };
  }
}

/**
 * Delete test lessons from the database
 */
export async function cleanupTestLessons(): Promise<{ deleted: number; errors: any[] }> {
  const supabase = getSupabaseClient();
  let deleted = 0;
  const errors: any[] = [];

  try {
    const { data: lessons, error: fetchError } = await supabase
      .from('lessons')
      .select('id, title');

    if (fetchError) {
      console.error('Error fetching lessons for cleanup:', fetchError);
      errors.push(fetchError);
      return { deleted, errors };
    }

    if (!lessons || lessons.length === 0) {
      console.log('No lessons found for cleanup');
      return { deleted, errors };
    }

    const testLessons = lessons.filter(lesson =>
      matchesPattern(lesson.title, TEST_PATTERNS.lessons.titles)
    );

    console.log(`Found ${testLessons.length} test lessons to delete`);

    for (const lesson of testLessons) {
      const { error: deleteError } = await supabase
        .from('lessons')
        .delete()
        .eq('id', lesson.id);

      if (deleteError) {
        console.error(`Error deleting lesson ${lesson.id}:`, deleteError);
        errors.push({ lesson, error: deleteError });
      } else {
        deleted++;
        console.log(`Deleted test lesson: ${lesson.title}`);
      }
    }

    return { deleted, errors };
  } catch (error) {
    console.error('Unexpected error during lesson cleanup:', error);
    errors.push(error);
    return { deleted, errors };
  }
}

/**
 * Delete test assignments from the database
 */
export async function cleanupTestAssignments(): Promise<{ deleted: number; errors: any[] }> {
  const supabase = getSupabaseClient();
  let deleted = 0;
  const errors: any[] = [];

  try {
    const { data: assignments, error: fetchError } = await supabase
      .from('assignments')
      .select('id, title');

    if (fetchError) {
      console.error('Error fetching assignments for cleanup:', fetchError);
      errors.push(fetchError);
      return { deleted, errors };
    }

    if (!assignments || assignments.length === 0) {
      console.log('No assignments found for cleanup');
      return { deleted, errors };
    }

    const testAssignments = assignments.filter(assignment =>
      matchesPattern(assignment.title, TEST_PATTERNS.assignments.titles)
    );

    console.log(`Found ${testAssignments.length} test assignments to delete`);

    for (const assignment of testAssignments) {
      const { error: deleteError } = await supabase
        .from('assignments')
        .delete()
        .eq('id', assignment.id);

      if (deleteError) {
        console.error(`Error deleting assignment ${assignment.id}:`, deleteError);
        errors.push({ assignment, error: deleteError });
      } else {
        deleted++;
        console.log(`Deleted test assignment: ${assignment.title}`);
      }
    }

    return { deleted, errors };
  } catch (error) {
    console.error('Unexpected error during assignment cleanup:', error);
    errors.push(error);
    return { deleted, errors };
  }
}

/**
 * Clean up all test data
 */
export async function cleanupAllTestData(): Promise<void> {
  console.log('\n🧹 Starting test data cleanup...\n');

  const results = {
    songs: await cleanupTestSongs(),
    lessons: await cleanupTestLessons(),
    assignments: await cleanupTestAssignments(),
  };

  console.log('\n📊 Cleanup Summary:');
  console.log(`  Songs deleted: ${results.songs.deleted}`);
  console.log(`  Lessons deleted: ${results.lessons.deleted}`);
  console.log(`  Assignments deleted: ${results.assignments.deleted}`);

  const totalErrors = results.songs.errors.length +
                     results.lessons.errors.length +
                     results.assignments.errors.length;

  if (totalErrors > 0) {
    console.log(`  ⚠️  Errors encountered: ${totalErrors}`);
  } else {
    console.log('  ✅ Cleanup completed successfully\n');
  }
}
