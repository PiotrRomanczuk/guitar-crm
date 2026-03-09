import {
  getSpotifyToken,
  searchSpotifyTrack,
  clearTokenCache,
} from '../spotify-enrichment';

// Save original env
const originalEnv = process.env;

beforeEach(() => {
  jest.clearAllMocks();
  clearTokenCache();
  process.env = {
    ...originalEnv,
    SPOTIFY_CLIENT_ID: 'test-client-id',
    SPOTIFY_CLIENT_SECRET: 'test-client-secret',
  };
});

afterEach(() => {
  process.env = originalEnv;
  jest.restoreAllMocks();
});

const mockTokenResponse = {
  access_token: 'mock-access-token',
  token_type: 'Bearer',
  expires_in: 3600,
};

const mockSearchResponse = {
  tracks: {
    items: [
      {
        id: 'spotify-track-123',
        name: 'Wonderwall',
        artists: [{ name: 'Oasis' }],
        album: {
          name: "(What's the Story) Morning Glory?",
          images: [
            { url: 'https://i.scdn.co/image/640.jpg', width: 640, height: 640 },
            { url: 'https://i.scdn.co/image/300.jpg', width: 300, height: 300 },
          ],
          release_date: '1995-10-02',
        },
        duration_ms: 258773,
        popularity: 82,
        preview_url: 'https://p.scdn.co/preview/abc',
        external_urls: { spotify: 'https://open.spotify.com/track/123' },
        external_ids: { isrc: 'GBAYE9500110' },
      },
    ],
  },
};

describe('getSpotifyToken', () => {
  it('should return null when credentials are missing', async () => {
    delete process.env.SPOTIFY_CLIENT_ID;
    const token = await getSpotifyToken();
    expect(token).toBeNull();
  });

  it('should fetch a token from Spotify', async () => {
    global.fetch = jest.fn().mockResolvedValue({
      ok: true,
      json: () => Promise.resolve(mockTokenResponse),
    });

    const token = await getSpotifyToken();
    expect(token).toBe('mock-access-token');
    expect(fetch).toHaveBeenCalledWith(
      expect.stringContaining('spotify.com'),
      expect.objectContaining({ method: 'POST' })
    );
  });

  it('should cache the token on subsequent calls', async () => {
    global.fetch = jest.fn().mockResolvedValue({
      ok: true,
      json: () => Promise.resolve(mockTokenResponse),
    });

    await getSpotifyToken();
    await getSpotifyToken();
    expect(fetch).toHaveBeenCalledTimes(1);
  });

  it('should return null on token request failure', async () => {
    global.fetch = jest.fn().mockResolvedValue({
      ok: false,
      status: 401,
    });

    const token = await getSpotifyToken();
    expect(token).toBeNull();
  });
});

describe('searchSpotifyTrack', () => {
  beforeEach(() => {
    // First call = token, second call = search
    global.fetch = jest
      .fn()
      .mockResolvedValueOnce({
        ok: true,
        json: () => Promise.resolve(mockTokenResponse),
      })
      .mockResolvedValueOnce({
        ok: true,
        json: () => Promise.resolve(mockSearchResponse),
      });
  });

  it('should return enriched metadata for a found track', async () => {
    const result = await searchSpotifyTrack('Wonderwall', 'Oasis');

    expect(result).not.toBeNull();
    expect(result?.title).toBe('Wonderwall');
    expect(result?.artist).toBe('Oasis');
    expect(result?.album).toBe("(What's the Story) Morning Glory?");
    expect(result?.durationMs).toBe(258773);
    expect(result?.releaseYear).toBe(1995);
    expect(result?.spotifyUrl).toBe('https://open.spotify.com/track/123');
    expect(result?.coverImageUrl).toBe('https://i.scdn.co/image/640.jpg');
    expect(result?.isrc).toBe('GBAYE9500110');
  });

  it('should search with title only when no artist provided', async () => {
    await searchSpotifyTrack('Wonderwall');

    const searchCall = (fetch as jest.Mock).mock.calls[1];
    expect(searchCall[0]).toContain('track%3AWonderwall');
    expect(searchCall[0]).not.toContain('artist');
  });

  it('should return null when no tracks found', async () => {
    global.fetch = jest
      .fn()
      .mockResolvedValueOnce({
        ok: true,
        json: () => Promise.resolve(mockTokenResponse),
      })
      .mockResolvedValueOnce({
        ok: true,
        json: () => Promise.resolve({ tracks: { items: [] } }),
      });

    const result = await searchSpotifyTrack('Nonexistent Song 12345');
    expect(result).toBeNull();
  });

  it('should return null when credentials are missing', async () => {
    delete process.env.SPOTIFY_CLIENT_ID;
    const result = await searchSpotifyTrack('Wonderwall');
    expect(result).toBeNull();
  });

  it('should return null on search API failure', async () => {
    global.fetch = jest
      .fn()
      .mockResolvedValueOnce({
        ok: true,
        json: () => Promise.resolve(mockTokenResponse),
      })
      .mockResolvedValueOnce({
        ok: false,
        status: 429,
      });

    const result = await searchSpotifyTrack('Wonderwall');
    expect(result).toBeNull();
  });
});
