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
    const { matchId, songId } = body;

    if (!matchId || !songId) {
      return NextResponse.json({ error: 'matchId and songId are required' }, { status: 400 });
    }

    // Get the match details
    const { data: match, error: matchError } = await supabase
      .from('spotify_matches')
      .select('*')
      .eq('id', matchId)
      .eq('song_id', songId)
      .single();

    if (matchError || !match) {
      return NextResponse.json({ error: 'Match not found' }, { status: 404 });
    }

    // Update the song with Spotify data
    const updateData: {
      spotify_link_url: string;
      duration_ms: number;
      release_year: number | null;
      author?: string;
      cover_image_url?: string;
      updated_at: string;
    } = {
      spotify_link_url: match.spotify_url,
      duration_ms: match.spotify_duration_ms,
      release_year: match.spotify_release_date
        ? parseInt(match.spotify_release_date.split('-')[0])
        : null,
      updated_at: new Date().toISOString(),
    };

    // Set author from Spotify artist
    if (match.spotify_artist_name) {
      updateData.author = match.spotify_artist_name;
    }

    if (match.spotify_cover_image_url) {
      updateData.cover_image_url = match.spotify_cover_image_url;
    }

    const { error: updateError } = await supabase.from('songs').update(updateData).eq('id', songId);

    if (updateError) {
      throw updateError;
    }

    // Update the match status to approved
    const { error: statusError } = await supabase
      .from('spotify_matches')
      .update({
        status: 'approved',
        reviewed_at: new Date().toISOString(),
        reviewed_by: user.id,
      })
      .eq('id', matchId);

    if (statusError) {
      throw statusError;
    }

    return NextResponse.json({
      success: true,
      message: 'Match approved and song updated',
    });
  } catch (error) {
    console.error('Failed to approve match:', error);
    return NextResponse.json(
      {
        error: 'Failed to approve match',
        details: error instanceof Error ? error.message : 'Unknown error',
      },
      { status: 500 }
    );
  }
}
