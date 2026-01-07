import { NextResponse } from 'next/server';
import { createClient } from '@/lib/supabase/server';

export async function POST(request: Request) {
  const supabase = await createClient();

  // Check authentication
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  // Check permissions
  const { data: profile } = await supabase
    .from('user_overview')
    .select('is_admin, is_teacher')
    .eq('user_id', user.id)
    .single();

  if (!profile?.is_admin && !profile?.is_teacher) {
    return NextResponse.json({ error: 'Forbidden' }, { status: 403 });
  }

  try {
    const body = await request.json();
    const { matchId, action } = body;

    if (!matchId || !action) {
      return NextResponse.json({ error: 'Missing matchId or action' }, { status: 400 });
    }

    if (!['approve', 'reject'].includes(action)) {
      return NextResponse.json(
        { error: 'Action must be either "approve" or "reject"' },
        { status: 400 }
      );
    }

    // Get the match with song details
    const { data: match, error: fetchError } = await supabase
      .from('spotify_matches')
      .select(
        `
        *,
        songs!inner(id, title, artist)
      `
      )
      .eq('id', matchId)
      .eq('status', 'pending')
      .single();

    if (fetchError || !match) {
      return NextResponse.json({ error: 'Match not found or already processed' }, { status: 404 });
    }

    if (action === 'approve') {
      // Update the song with Spotify data
      const spotifyData = match.spotify_data as any;
      const updateData = {
        spotify_link_url: spotifyData.external_urls?.spotify,
        duration_ms: spotifyData.duration_ms,
        release_year: spotifyData.release_date
          ? parseInt(spotifyData.release_date.split('-')[0])
          : null,
        cover_image_url: spotifyData.images?.[0]?.url,
        updated_at: new Date().toISOString(),
      };

      const { error: updateError } = await supabase
        .from('songs')
        .update(updateData)
        .eq('id', match.song_id);

      if (updateError) {
        return NextResponse.json(
          { error: `Failed to update song: ${updateError.message}` },
          { status: 500 }
        );
      }

      // Mark match as approved
      const { error: approveError } = await supabase
        .from('spotify_matches')
        .update({
          status: 'approved',
          reviewed_by: user.id,
          reviewed_at: new Date().toISOString(),
        })
        .eq('id', matchId);

      if (approveError) {
        return NextResponse.json(
          { error: `Failed to mark as approved: ${approveError.message}` },
          { status: 500 }
        );
      }

      console.log(`✅ Match approved: "${match.songs.title}" → "${spotifyData.name}"`);

      return NextResponse.json({
        success: true,
        action: 'approved',
        message: `Successfully updated "${match.songs.title}" with Spotify data`,
      });
    } else if (action === 'reject') {
      // Mark match as rejected
      const { error: rejectError } = await supabase
        .from('spotify_matches')
        .update({
          status: 'rejected',
          reviewed_by: user.id,
          reviewed_at: new Date().toISOString(),
        })
        .eq('id', matchId);

      if (rejectError) {
        return NextResponse.json(
          { error: `Failed to mark as rejected: ${rejectError.message}` },
          { status: 500 }
        );
      }

      console.log(`❌ Match rejected: "${match.songs.title}"`);

      return NextResponse.json({
        success: true,
        action: 'rejected',
        message: `Rejected match for "${match.songs.title}"`,
      });
    }
  } catch (error) {
    console.error('Error processing match action:', error);
    return NextResponse.json({ error: 'Failed to process match action' }, { status: 500 });
  }
}
