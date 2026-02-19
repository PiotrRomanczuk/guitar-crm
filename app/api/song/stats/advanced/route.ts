import { NextResponse } from 'next/server';
import { createAdminClient } from '@/lib/supabase/admin';
import { getUserWithRolesSSR } from '@/lib/getUserWithRolesSSR';
import type { SongStatsAdvanced } from '@/types/SongStatsAdvanced';
import {
  computeOverview,
  computeTempoStats,
  computeKeyDistribution,
  computeLevelDistribution,
  computeCategoryDistribution,
  computeLibraryGrowth,
  computeSunburst,
  computeReleaseYearStats,
} from './helpers';

export async function GET() {
  try {
    const { user, isAdmin, isTeacher } = await getUserWithRolesSSR();

    if (!user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    if (!isAdmin && !isTeacher) {
      return NextResponse.json({ error: 'Forbidden' }, { status: 403 });
    }

    const adminClient = createAdminClient();

    const { data: songs, error } = await adminClient
      .from('songs')
      .select(
        'title, author, level, key, tempo, category, release_year, chords, strumming_pattern, audio_files, youtube_url, spotify_link_url, created_at'
      )
      .is('deleted_at', null);

    if (error) {
      console.error('[SongStatsAdvanced] Query error:', error);
      return NextResponse.json({ error: 'Database query failed' }, { status: 500 });
    }

    const rows = songs ?? [];

    const result: SongStatsAdvanced = {
      overview: computeOverview(rows),
      tempo: computeTempoStats(rows),
      keyDistribution: computeKeyDistribution(rows),
      levelDistribution: computeLevelDistribution(rows),
      categoryDistribution: computeCategoryDistribution(rows),
      libraryGrowth: computeLibraryGrowth(rows),
      sunburst: computeSunburst(rows),
      releaseYear: computeReleaseYearStats(rows),
    };

    return NextResponse.json(result);
  } catch (error) {
    console.error('[SongStatsAdvanced] Error:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
