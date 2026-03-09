/**
 * Spotify enrichment service for quick-capture
 *
 * Wraps the existing Spotify client (lib/spotify.ts) to provide a
 * simple "search and extract metadata" function for the quick-capture
 * endpoint. Reuses the circuit breaker, retry logic, and token caching
 * from the core client.
 *
 * NOTE: Spotify deprecated the Audio Features API (BPM/tempo/key) in 2024.
 * We can only get basic track metadata from the Search endpoint.
 */

import { searchTracks } from '@/lib/spotify';
import type { SpotifyApiTrack } from '@/types/spotify';

export interface SpotifyTrackMetadata {
  spotifyId: string;
  spotifyUrl: string;
  title: string;
  artist: string;
  album: string;
  coverImageUrl: string | null;
  durationMs: number;
  releaseDate: string;
  releaseYear: number | null;
}

interface SpotifySearchResult {
  tracks: {
    items: SpotifyApiTrack[];
  };
}

/**
 * Search Spotify for a track by title and artist.
 * Returns enriched metadata or null if not found / credentials missing.
 *
 * Uses the existing searchTracks client which has circuit breaker,
 * rate limiting, and retry logic built in.
 */
export async function searchSpotifyTrack(
  title: string,
  artist?: string
): Promise<SpotifyTrackMetadata | null> {
  const query = artist
    ? `track:${title} artist:${artist}`
    : `track:${title}`;

  const result = (await searchTracks(query)) as SpotifySearchResult;
  const track = result?.tracks?.items?.[0];

  if (!track) return null;

  const releaseYear = parseReleaseYear(track.album.release_date);
  const coverImage = track.album.images?.[0]?.url ?? null;

  return {
    spotifyId: track.id,
    spotifyUrl: track.external_urls.spotify,
    title: track.name,
    artist: track.artists.map((a) => a.name).join(', '),
    album: track.album.name,
    coverImageUrl: coverImage,
    durationMs: track.duration_ms,
    releaseDate: track.album.release_date,
    releaseYear,
  };
}

function parseReleaseYear(releaseDate: string): number | null {
  const year = parseInt(releaseDate.substring(0, 4), 10);
  return isNaN(year) ? null : year;
}
