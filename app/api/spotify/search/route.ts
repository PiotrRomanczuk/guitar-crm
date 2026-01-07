import { NextResponse } from 'next/server';
import { searchTracks } from '@/lib/spotify';
import { SpotifyApiTrack } from '@/types/spotify';

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const query = searchParams.get('q');

  if (!query) {
    return NextResponse.json({ error: 'Query parameter "q" is required' }, { status: 400 });
  }

  try {
    const data = await searchTracks(query);

    if (data.error) {
      return NextResponse.json({ error: data.error.message }, { status: data.error.status });
    }

    const results = data.tracks.items.map((track: SpotifyApiTrack) => ({
      id: track.id,
      name: track.name,
      artist: track.artists[0].name,
      album: track.album.name,
      url: track.external_urls.spotify,
      coverUrl: track.album.images[0]?.url,
      duration_ms: track.duration_ms,
      release_date: track.album.release_date,
    }));

    return NextResponse.json({ results });
  } catch (error) {
    console.error('Spotify Search Error:', error);
    return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
  }
}
