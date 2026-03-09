import { searchSpotifyTrack } from '../spotify-enrichment';

// Mock the existing Spotify client
jest.mock('@/lib/spotify', () => ({
  searchTracks: jest.fn(),
}));

import { searchTracks } from '@/lib/spotify';

const mockSearchTracks = searchTracks as jest.MockedFunction<typeof searchTracks>;

const mockSearchResult = {
  tracks: {
    items: [
      {
        id: 'spotify-track-123',
        name: 'Wonderwall',
        artists: [{ name: 'Oasis' }],
        album: {
          name: "(What's the Story) Morning Glory?",
          images: [
            { url: 'https://i.scdn.co/image/640.jpg' },
            { url: 'https://i.scdn.co/image/300.jpg' },
          ],
          release_date: '1995-10-02',
        },
        duration_ms: 258773,
        external_urls: { spotify: 'https://open.spotify.com/track/123' },
      },
    ],
  },
};

beforeEach(() => {
  jest.clearAllMocks();
});

describe('searchSpotifyTrack', () => {
  it('should return enriched metadata for a found track', async () => {
    mockSearchTracks.mockResolvedValue(mockSearchResult);

    const result = await searchSpotifyTrack('Wonderwall', 'Oasis');

    expect(result).not.toBeNull();
    expect(result?.title).toBe('Wonderwall');
    expect(result?.artist).toBe('Oasis');
    expect(result?.album).toBe("(What's the Story) Morning Glory?");
    expect(result?.durationMs).toBe(258773);
    expect(result?.releaseYear).toBe(1995);
    expect(result?.spotifyUrl).toBe('https://open.spotify.com/track/123');
    expect(result?.coverImageUrl).toBe('https://i.scdn.co/image/640.jpg');
  });

  it('should build correct query with title and artist', async () => {
    mockSearchTracks.mockResolvedValue(mockSearchResult);

    await searchSpotifyTrack('Wonderwall', 'Oasis');

    expect(mockSearchTracks).toHaveBeenCalledWith('track:Wonderwall artist:Oasis');
  });

  it('should build query with title only when no artist', async () => {
    mockSearchTracks.mockResolvedValue(mockSearchResult);

    await searchSpotifyTrack('Wonderwall');

    expect(mockSearchTracks).toHaveBeenCalledWith('track:Wonderwall');
  });

  it('should return null when no tracks found', async () => {
    mockSearchTracks.mockResolvedValue({ tracks: { items: [] } });

    const result = await searchSpotifyTrack('Nonexistent Song 12345');
    expect(result).toBeNull();
  });

  it('should propagate errors from the Spotify client', async () => {
    mockSearchTracks.mockRejectedValue(new Error('Spotify API circuit breaker is open'));

    await expect(searchSpotifyTrack('Wonderwall')).rejects.toThrow(
      'circuit breaker'
    );
  });

  it('should return null when result has no tracks property', async () => {
    mockSearchTracks.mockResolvedValue({});

    const result = await searchSpotifyTrack('Wonderwall');
    expect(result).toBeNull();
  });

  it('should handle tracks with multiple artists', async () => {
    mockSearchTracks.mockResolvedValue({
      tracks: {
        items: [
          {
            ...mockSearchResult.tracks.items[0],
            artists: [{ name: 'Artist A' }, { name: 'Artist B' }],
          },
        ],
      },
    });

    const result = await searchSpotifyTrack('Collab Song');
    expect(result?.artist).toBe('Artist A, Artist B');
  });

  it('should handle album with no images', async () => {
    mockSearchTracks.mockResolvedValue({
      tracks: {
        items: [
          {
            ...mockSearchResult.tracks.items[0],
            album: {
              ...mockSearchResult.tracks.items[0].album,
              images: [],
            },
          },
        ],
      },
    });

    const result = await searchSpotifyTrack('Wonderwall');
    expect(result?.coverImageUrl).toBeNull();
  });

  it('should parse release year from different date formats', async () => {
    // Year-only format (e.g., "1995")
    mockSearchTracks.mockResolvedValue({
      tracks: {
        items: [
          {
            ...mockSearchResult.tracks.items[0],
            album: {
              ...mockSearchResult.tracks.items[0].album,
              release_date: '2023',
            },
          },
        ],
      },
    });

    const result = await searchSpotifyTrack('Recent Song');
    expect(result?.releaseYear).toBe(2023);
  });
});
