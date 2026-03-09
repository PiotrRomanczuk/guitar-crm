/**
 * Spotify enrichment service
 *
 * Uses Spotify's Client Credentials flow to search for tracks and
 * extract metadata (album, duration, release year, cover art, Spotify URL).
 *
 * NOTE: Spotify deprecated the Audio Features API (BPM/tempo/key) in 2024.
 * We can only get basic track metadata from the Search endpoint.
 *
 * Required env vars:
 *   SPOTIFY_CLIENT_ID
 *   SPOTIFY_CLIENT_SECRET
 */

const SPOTIFY_TOKEN_URL = 'https://accounts.spotify.com/api/v1/token';
const SPOTIFY_SEARCH_URL = 'https://api.spotify.com/v1/search';

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
  popularity: number;
  previewUrl: string | null;
  isrc: string | null;
}

interface SpotifyTokenResponse {
  access_token: string;
  token_type: string;
  expires_in: number;
}

interface SpotifyArtist {
  name: string;
}

interface SpotifyImage {
  url: string;
  height: number;
  width: number;
}

interface SpotifyAlbum {
  name: string;
  images: SpotifyImage[];
  release_date: string;
}

interface SpotifyExternalIds {
  isrc?: string;
}

interface SpotifyTrack {
  id: string;
  name: string;
  artists: SpotifyArtist[];
  album: SpotifyAlbum;
  duration_ms: number;
  popularity: number;
  preview_url: string | null;
  external_urls: { spotify: string };
  external_ids?: SpotifyExternalIds;
}

interface SpotifySearchResponse {
  tracks: {
    items: SpotifyTrack[];
  };
}

// Simple in-memory token cache
let cachedToken: { token: string; expiresAt: number } | null = null;

/**
 * Get a Spotify access token using Client Credentials flow.
 * Caches the token until it expires.
 */
export async function getSpotifyToken(): Promise<string | null> {
  const clientId = process.env.SPOTIFY_CLIENT_ID;
  const clientSecret = process.env.SPOTIFY_CLIENT_SECRET;

  if (!clientId || !clientSecret) {
    console.warn('[Spotify] Missing SPOTIFY_CLIENT_ID or SPOTIFY_CLIENT_SECRET');
    return null;
  }

  // Return cached token if still valid (with 60s buffer)
  if (cachedToken && Date.now() < cachedToken.expiresAt - 60_000) {
    return cachedToken.token;
  }

  const credentials = Buffer.from(`${clientId}:${clientSecret}`).toString('base64');

  const response = await fetch(SPOTIFY_TOKEN_URL, {
    method: 'POST',
    headers: {
      'Authorization': `Basic ${credentials}`,
      'Content-Type': 'application/x-www-form-urlencoded',
    },
    body: 'grant_type=client_credentials',
  });

  if (!response.ok) {
    console.error('[Spotify] Token request failed:', response.status);
    return null;
  }

  const data: SpotifyTokenResponse = await response.json();
  cachedToken = {
    token: data.access_token,
    expiresAt: Date.now() + data.expires_in * 1000,
  };

  return data.access_token;
}

/**
 * Search Spotify for a track by title and artist.
 * Returns enriched metadata or null if not found / credentials missing.
 */
export async function searchSpotifyTrack(
  title: string,
  artist?: string
): Promise<SpotifyTrackMetadata | null> {
  const token = await getSpotifyToken();
  if (!token) return null;

  const query = artist ? `track:${title} artist:${artist}` : `track:${title}`;
  const params = new URLSearchParams({
    q: query,
    type: 'track',
    limit: '1',
  });

  const response = await fetch(`${SPOTIFY_SEARCH_URL}?${params}`, {
    headers: { 'Authorization': `Bearer ${token}` },
  });

  if (!response.ok) {
    console.error('[Spotify] Search failed:', response.status);
    return null;
  }

  const data: SpotifySearchResponse = await response.json();
  const track = data.tracks?.items?.[0];

  if (!track) return null;

  const releaseYear = parseReleaseYear(track.album.release_date);
  const coverImage = track.album.images?.find((img) => img.width === 640)
    ?? track.album.images?.[0];

  return {
    spotifyId: track.id,
    spotifyUrl: track.external_urls.spotify,
    title: track.name,
    artist: track.artists.map((a) => a.name).join(', '),
    album: track.album.name,
    coverImageUrl: coverImage?.url ?? null,
    durationMs: track.duration_ms,
    releaseDate: track.album.release_date,
    releaseYear,
    popularity: track.popularity,
    previewUrl: track.preview_url,
    isrc: track.external_ids?.isrc ?? null,
  };
}

function parseReleaseYear(releaseDate: string): number | null {
  const year = parseInt(releaseDate.substring(0, 4), 10);
  return isNaN(year) ? null : year;
}

/**
 * Clear the cached token (useful for testing)
 */
export function clearTokenCache(): void {
  cachedToken = null;
}
