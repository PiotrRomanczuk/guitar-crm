/**
 * Integration tests for the Quick Capture endpoint.
 *
 * Tests the full flow: API key auth → Spotify enrichment → song creation.
 * Uses mocked Supabase (via unified-db) and mocked Spotify API.
 */

import { POST } from '@/app/api/external/songs/quick-capture/route';
import { NextRequest } from 'next/server';

// Mock bearer auth
jest.mock('@/lib/bearer-auth', () => ({
  extractBearerToken: jest.fn(),
  authenticateWithBearerToken: jest.fn(),
}));

// Mock unified DB
jest.mock('@/lib/api/unified-db', () => ({
  db: {
    songs: {
      findAll: jest.fn(),
      create: jest.fn(),
    },
  },
}));

// Mock Spotify enrichment
jest.mock('@/lib/services/spotify-enrichment', () => ({
  searchSpotifyTrack: jest.fn(),
}));

import {
  extractBearerToken,
  authenticateWithBearerToken,
} from '@/lib/bearer-auth';
import { db } from '@/lib/api/unified-db';
import { searchSpotifyTrack } from '@/lib/services/spotify-enrichment';

const mockExtractBearer = extractBearerToken as jest.MockedFunction<
  typeof extractBearerToken
>;
const mockAuthBearer = authenticateWithBearerToken as jest.MockedFunction<
  typeof authenticateWithBearerToken
>;
const mockFindAll = db.songs.findAll as jest.MockedFunction<
  typeof db.songs.findAll
>;
const mockCreate = db.songs.create as jest.MockedFunction<
  typeof db.songs.create
>;
const mockSpotifySearch = searchSpotifyTrack as jest.MockedFunction<
  typeof searchSpotifyTrack
>;

function makeRequest(body: Record<string, unknown>, token?: string) {
  const headers: Record<string, string> = {
    'Content-Type': 'application/json',
  };
  if (token) headers['Authorization'] = `Bearer ${token}`;

  return new NextRequest(
    'http://localhost:3000/api/external/songs/quick-capture',
    {
      method: 'POST',
      headers,
      body: JSON.stringify(body),
    }
  );
}

function authenticateAs(userId: string) {
  mockExtractBearer.mockReturnValue(`gcrm_test_${userId}`);
  mockAuthBearer.mockResolvedValue({
    userId,
    profile: { id: userId },
  });
}

describe('Quick Capture Integration: API Key → Spotify → Create', () => {
  beforeEach(() => {
    jest.clearAllMocks();
    mockFindAll.mockResolvedValue({ data: [], error: null, isLocal: true });
  });

  describe('Full AirPods → Shortcut → Strummy flow', () => {
    it('should capture song with Spotify enrichment', async () => {
      authenticateAs('teacher-1');

      mockSpotifySearch.mockResolvedValue({
        spotifyId: 'sp-123',
        spotifyUrl: 'https://open.spotify.com/track/123',
        title: 'Wonderwall',
        artist: 'Oasis',
        album: "(What's the Story) Morning Glory?",
        coverImageUrl: 'https://i.scdn.co/image/cover.jpg',
        durationMs: 258773,
        releaseDate: '1995-10-02',
        releaseYear: 1995,
      });

      mockCreate.mockResolvedValue({
        data: {
          id: 'new-song-1',
          title: 'Wonderwall',
          author: 'Oasis',
          spotify_link_url: 'https://open.spotify.com/track/123',
        },
        error: null,
        isLocal: true,
      });

      const res = await POST(
        makeRequest(
          { title: 'Wonderwall', author: 'Oasis' },
          'gcrm_test_teacher-1'
        )
      );
      const json = await res.json();

      expect(res.status).toBe(201);
      expect(json.meta.action).toBe('created');
      expect(json.meta.enriched).toBe(true);
      expect(json.meta.spotify).toEqual(
        expect.objectContaining({
          album: "(What's the Story) Morning Glory?",
          duration_ms: 258773,
          release_year: 1995,
        })
      );

      // Verify the song was created with Spotify data merged in
      expect(mockCreate).toHaveBeenCalledWith(
        expect.objectContaining({
          title: 'Wonderwall',
          author: 'Oasis',
          spotify_link_url: 'https://open.spotify.com/track/123',
          cover_image_url: 'https://i.scdn.co/image/cover.jpg',
          duration_ms: 258773,
          release_year: 1995,
          category: "(What's the Story) Morning Glory?",
        })
      );
    });

    it('should still create song when Spotify is unavailable', async () => {
      authenticateAs('teacher-1');
      mockSpotifySearch.mockResolvedValue(null);
      mockCreate.mockResolvedValue({
        data: { id: 'new-song-2', title: 'My Song', author: 'Unknown Artist' },
        error: null,
        isLocal: true,
      });

      const res = await POST(
        makeRequest({ title: 'My Song' }, 'gcrm_test_teacher-1')
      );
      const json = await res.json();

      expect(res.status).toBe(201);
      expect(json.meta.enriched).toBe(false);
      expect(json.meta.spotify).toBeNull();
    });

    it('should gracefully handle Spotify errors', async () => {
      authenticateAs('teacher-1');
      mockSpotifySearch.mockRejectedValue(new Error('Spotify rate limited'));
      mockCreate.mockResolvedValue({
        data: { id: 'new-song-3', title: 'My Song', author: 'Unknown Artist' },
        error: null,
        isLocal: true,
      });

      const res = await POST(
        makeRequest({ title: 'My Song' }, 'gcrm_test_teacher-1')
      );
      const json = await res.json();

      expect(res.status).toBe(201);
      expect(json.meta.enriched).toBe(false);
    });
  });

  describe('Duplicate detection flow', () => {
    it('should detect duplicate even when Spotify not called', async () => {
      authenticateAs('teacher-1');
      mockFindAll.mockResolvedValue({
        data: [
          {
            id: 'existing-1',
            title: 'Wonderwall',
            author: 'Oasis',
            level: 'intermediate',
          },
        ],
        error: null,
        isLocal: true,
      });

      const res = await POST(
        makeRequest(
          { title: 'wonderwall', author: 'oasis' },
          'gcrm_test_teacher-1'
        )
      );
      const json = await res.json();

      expect(res.status).toBe(200);
      expect(json.meta.action).toBe('already_exists');
      // Spotify should NOT be called for duplicates
      expect(mockSpotifySearch).not.toHaveBeenCalled();
      expect(mockCreate).not.toHaveBeenCalled();
    });
  });

  describe('API key auth enforcement', () => {
    it('should reject requests without bearer token', async () => {
      mockExtractBearer.mockReturnValue(null);

      const res = await POST(makeRequest({ title: 'Test' }));
      expect(res.status).toBe(401);
    });

    it('should reject requests with invalid API key', async () => {
      mockExtractBearer.mockReturnValue('invalid_key');
      mockAuthBearer.mockResolvedValue(null);

      const res = await POST(makeRequest({ title: 'Test' }, 'invalid_key'));
      expect(res.status).toBe(401);
    });
  });

  describe('Payload from Apple Shortcuts', () => {
    it('should accept the exact payload Apple Shortcuts would send', async () => {
      authenticateAs('teacher-1');
      mockSpotifySearch.mockResolvedValue(null);
      mockCreate.mockResolvedValue({
        data: {
          id: 'song-from-shortcuts',
          title: 'Hotel California',
          author: 'Eagles',
        },
        error: null,
        isLocal: true,
      });

      // This mimics what "Get Current Song" + "Get Contents of URL" sends
      const shortcutPayload = {
        title: 'Hotel California',
        author: 'Eagles',
        album: 'Hotel California',
        duration_ms: 391000,
      };

      const res = await POST(
        makeRequest(shortcutPayload, 'gcrm_test_teacher-1')
      );
      const json = await res.json();

      expect(res.status).toBe(201);
      expect(json.song.title).toBe('Hotel California');
    });

    it('should handle minimal payload (title only)', async () => {
      authenticateAs('teacher-1');
      mockSpotifySearch.mockResolvedValue(null);
      mockCreate.mockResolvedValue({
        data: { id: 'song-minimal', title: 'Unknown Track', author: 'Unknown Artist' },
        error: null,
        isLocal: true,
      });

      const res = await POST(
        makeRequest({ title: 'Unknown Track' }, 'gcrm_test_teacher-1')
      );
      expect(res.status).toBe(201);
    });
  });
});
