import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@/lib/supabase/server';
import { createAdminClient } from '@/lib/supabase/admin';
import { syncDriveVideosToSongs } from '@/lib/services/drive-video-sync';
import { createLogger } from '@/lib/logger';

const log = createLogger('DriveSyncAPI');

/**
 * Verify the caller is an authenticated admin or teacher.
 * Returns the user ID or a JSON error response.
 */
async function authorizeAdminOrTeacher(): Promise<
  { userId: string } | NextResponse
> {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  const { data: profile } = await supabase
    .from('profiles')
    .select('is_admin, is_teacher')
    .eq('id', user.id)
    .single();

  if (!profile?.is_admin && !profile?.is_teacher) {
    return NextResponse.json({ error: 'Forbidden' }, { status: 403 });
  }

  return { userId: user.id };
}

/**
 * GET /api/admin/drive-sync?folder=07_Guitar+Videos&folderId=xxx
 * Preview matches (dry run). Returns match results without inserting.
 */
export async function GET(request: NextRequest) {
  try {
    const auth = await authorizeAdminOrTeacher();
    if (auth instanceof NextResponse) return auth;

    const { searchParams } = new URL(request.url);
    const folderName = searchParams.get('folder') || undefined;
    const folderId = searchParams.get('folderId') || undefined;

    const adminClient = createAdminClient();
    const result = await syncDriveVideosToSongs({
      folderName,
      folderId,
      dryRun: true,
      uploadedByUserId: auth.userId,
      supabase: adminClient,
    });

    return NextResponse.json({
      preview: true,
      totalFiles: result.totalFiles,
      matched: result.matched,
      ambiguous: result.ambiguous,
      unmatched: result.unmatched,
      skipped: result.skipped,
      results: result.results.map((r) => ({
        filename: r.driveFile.name,
        driveFileId: r.driveFile.id,
        parsed: r.parsed,
        status: r.status,
        bestMatch: r.bestMatch
          ? {
              songId: r.bestMatch.song.id,
              title: r.bestMatch.song.title,
              author: r.bestMatch.song.author,
              score: r.bestMatch.score,
            }
          : null,
        runnerUp: r.runnerUp
          ? {
              songId: r.runnerUp.song.id,
              title: r.runnerUp.song.title,
              author: r.runnerUp.song.author,
              score: r.runnerUp.score,
            }
          : null,
      })),
    });
  } catch (error) {
    log.error('Drive sync preview failed', {
      error: error instanceof Error ? error.message : String(error),
    });
    return NextResponse.json(
      { error: error instanceof Error ? error.message : 'Internal server error' },
      { status: 500 }
    );
  }
}

/**
 * POST /api/admin/drive-sync
 * Execute sync. Body can include { overrides: { driveFileId: songId } }.
 */
export async function POST(request: NextRequest) {
  try {
    const auth = await authorizeAdminOrTeacher();
    if (auth instanceof NextResponse) return auth;

    const body = await request.json().catch(() => ({}));
    const overrides = (body.overrides as Record<string, string>) || undefined;
    const folderName = (body.folder as string) || undefined;
    const folderId = (body.folderId as string) || undefined;

    const adminClient = createAdminClient();
    const result = await syncDriveVideosToSongs({
      folderName,
      folderId,
      dryRun: false,
      uploadedByUserId: auth.userId,
      supabase: adminClient,
      overrides,
    });

    log.info('Drive sync completed', {
      inserted: result.inserted,
      matched: result.matched,
      ambiguous: result.ambiguous,
      unmatched: result.unmatched,
    });

    return NextResponse.json({
      success: true,
      totalFiles: result.totalFiles,
      matched: result.matched,
      inserted: result.inserted,
      ambiguous: result.ambiguous,
      unmatched: result.unmatched,
      skipped: result.skipped,
    });
  } catch (error) {
    log.error('Drive sync execution failed', {
      error: error instanceof Error ? error.message : String(error),
    });
    return NextResponse.json(
      { error: error instanceof Error ? error.message : 'Internal server error' },
      { status: 500 }
    );
  }
}
