import { NextResponse } from 'next/server';
import { createClient } from '@/lib/supabase/server';
import { searchTracks } from '@/lib/spotify';
import { SpotifyApiTrack } from '@/types/spotify';

export async function POST(request: Request) {
  const supabase = await createClient();

  // Check authentication
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  // Check permissions (optional, but good practice)
  const { data: profile } = await supabase
    .from('user_overview')
    .select('is_admin, is_teacher')
    .eq('user_id', user.id)
    .single();

  if (!profile?.is_admin && !profile?.is_teacher) {
    return NextResponse.json({ error: 'Forbidden' }, { status: 403 });
  }

  // Parse query parameters
  const url = new URL(request.url);
  const limit = parseInt(url.searchParams.get('limit') || '20');
  const force = url.searchParams.get('force') === 'true';

  // 1. Fetch songs
  let queryBuilder = supabase.from('songs').select('*').is('deleted_at', null); // Only active songs

  if (!force) {
    // Prioritize songs missing Spotify data
    queryBuilder = queryBuilder.is('spotify_link_url', null);
  }

  const { data: songs, error } = await queryBuilder.limit(limit);

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }

  const results = {
    total: songs.length,
    updated: 0,
    failed: 0,
    skipped: 0,
    errors: [] as string[],
  };

  // 2. Iterate and sync
  for (const song of songs) {
    try {
      // Search query: track name and artist
      const query = `track:${song.title} artist:${song.author}`;
      let searchData = await searchTracks(query);

      // Fallback search if strict search fails
      if (!searchData?.tracks?.items?.length) {
        const fallbackQuery = `${song.title} ${song.author}`;
        searchData = await searchTracks(fallbackQuery);
      }

      if (searchData?.tracks?.items?.length > 0) {
        const track: SpotifyApiTrack = searchData.tracks.items[0];

        // Prepare update data
        const updateData: {
          spotify_link_url: string;
          duration_ms: number;
          release_year: number | null;
          cover_image_url?: string;
        } = {
          spotify_link_url: track.external_urls.spotify,
          duration_ms: track.duration_ms,
          release_year: track.album.release_date
            ? parseInt(track.album.release_date.split('-')[0])
            : null,
        };

        // Set cover image
        const imageUrl = track.album.images[0]?.url;
        if (imageUrl) {
          updateData.cover_image_url = imageUrl;
        }

        // Only update if there are changes (simple check)
        // For now, just update to ensure latest data
        const { error: updateError } = await supabase
          .from('songs')
          .update(updateData)
          .eq('id', song.id);

        if (updateError) {
          results.failed++;
          results.errors.push(`Failed to update ${song.title}: ${updateError.message}`);
        } else {
          results.updated++;
        }
      } else {
        results.skipped++; // No match found
      }
    } catch (e: unknown) {
      const errorMessage = e instanceof Error ? e.message : 'Unknown error';
      results.failed++;
      results.errors.push(`Error processing ${song.title}: ${errorMessage}`);
    }

    // Simple delay to be nice to API
    await new Promise((resolve) => setTimeout(resolve, 200));
  }

  return NextResponse.json(results);
}
