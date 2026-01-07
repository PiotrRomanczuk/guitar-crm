import { NextResponse } from 'next/server';
import { createClient } from '@/lib/supabase/server';
import { getTrack } from '@/lib/spotify';

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
    const { matchId, action, overrideSpotifyId } = body;

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
        songs!inner(id, title, author)
      `
      )
      .eq('id', matchId)
      .eq('status', 'pending')
      .single();

    if (fetchError || !match) {
      return NextResponse.json({ error: 'Match not found or already processed' }, { status: 404 });
    }

    if (action === 'approve') {
      let spotifyData;

      // If an alternative Spotify track was selected, fetch its data
      if (overrideSpotifyId) {
        try {
          const trackData = await getTrack(overrideSpotifyId);
          console.log('🎵 Fetched alternative track data:', {
            id: trackData.id,
            name: trackData.name,
            url: trackData.external_urls?.spotify,
            duration: trackData.duration_ms,
            album: trackData.album?.name,
            image: trackData.album?.images?.[0]?.url,
          });
          
          spotifyData = {
            spotify_url: trackData.external_urls.spotify,
            duration_ms: trackData.duration_ms,
            release_year: trackData.album.release_date
              ? parseInt(trackData.album.release_date.split('-')[0])
              : null,
            cover_image_url: trackData.album.images[0]?.url,
          };
        } catch (error) {
          console.error('Failed to fetch alternative Spotify track:', error);
          return NextResponse.json(
            { error: 'Failed to fetch alternative Spotify track data' },
            { status: 500 }
          );
        }
      } else {
        // Use the original matched Spotify data
        console.log('📋 Using original match data:', {
          url: match.spotify_url,
          duration: match.spotify_duration_ms,
          release: match.spotify_release_date,
          image: match.spotify_cover_image_url,
        });
        
        spotifyData = {
          spotify_url: match.spotify_url,
          duration_ms: match.spotify_duration_ms,
          release_year: match.spotify_release_date
            ? parseInt(match.spotify_release_date.split('-')[0])
            : null,
          cover_image_url: match.spotify_cover_image_url,
        };
      }

      // Update the song with Spotify data
      const updateData = {
        spotify_link_url: spotifyData.spotify_url,
        duration_ms: spotifyData.duration_ms,
        release_year: spotifyData.release_year,
        cover_image_url: spotifyData.cover_image_url,
        updated_at: new Date().toISOString(),
      };

      console.log(`📝 Updating song ${match.song_id} with data:`, updateData);

      const { data: updatedSong, error: updateError } = await supabase
        .from('songs')
        .update(updateData)
        .eq('id', match.song_id)
        .select()
        .single();

      if (updateError) {
        console.error('❌ Update error:', updateError);
        return NextResponse.json(
          { error: `Failed to update song: ${updateError.message}` },
          { status: 500 }
        );
      }

      console.log('✅ Song updated successfully:', updatedSong);

      // Mark match as approved
      console.log(`📝 Marking match as approved:`, {
        matchId,
        userId: user.id,
      });

      // First, delete any existing approved/rejected matches for this song to avoid unique constraint violations
      const { error: deleteError } = await supabase
        .from('spotify_matches')
        .delete()
        .eq('song_id', match.song_id)
        .neq('id', matchId);

      if (deleteError) {
        console.warn('⚠️  Could not delete old matches:', deleteError.message);
        // Continue anyway - this is not critical
      }

      const { data: approvedMatch, error: approveError } = await supabase
        .from('spotify_matches')
        .update({
          status: 'approved',
          reviewed_by: user.id,
          reviewed_at: new Date().toISOString(),
        })
        .eq('id', matchId)
        .select()
        .single();

      if (approveError) {
        console.error('❌ Approve error:', approveError);
        return NextResponse.json(
          { error: `Failed to mark as approved: ${approveError.message}` },
          { status: 500 }
        );
      }

      console.log('✅ Match marked as approved:', approvedMatch);

      console.log(
        `✅ Match approved: "${match.songs.title}" → ${overrideSpotifyId ? `Alternative track (${overrideSpotifyId})` : `"${match.spotify_track_name}"`}`
      );

      return NextResponse.json({
        success: true,
        action: 'approved',
        message: `Successfully updated "${match.songs.title}" with Spotify data`,
      });
    } else if (action === 'reject') {
      // Mark match as rejected
      console.log(`📝 Marking match as rejected:`, {
        matchId,
        userId: user.id,
      });

      const { data: rejectedMatch, error: rejectError } = await supabase
        .from('spotify_matches')
        .update({
          status: 'rejected',
          reviewed_by: user.id,
          reviewed_at: new Date().toISOString(),
        })
        .eq('id', matchId)
        .select()
        .single();

      if (rejectError) {
        console.error('❌ Reject error:', rejectError);
        return NextResponse.json(
          { error: `Failed to mark as rejected: ${rejectError.message}` },
          { status: 500 }
        );
      }

      console.log('✅ Match marked as rejected:', rejectedMatch);

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
