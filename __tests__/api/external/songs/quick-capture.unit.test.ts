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

import {
  extractBearerToken,
  authenticateWithBearerToken,
} from '@/lib/bearer-auth';
import { db } from '@/lib/api/unified-db';

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

function makeRequest(body: Record<string, unknown>, token?: string) {
  const headers: Record<string, string> = {
    'Content-Type': 'application/json',
  };
  if (token) headers['Authorization'] = `Bearer ${token}`;

  return new NextRequest('http://localhost:3000/api/external/songs/quick-capture', {
    method: 'POST',
    headers,
    body: JSON.stringify(body),
  });
}

describe('POST /api/external/songs/quick-capture', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('should return 401 when no token is provided', async () => {
    mockExtractBearer.mockReturnValue(null);

    const res = await POST(makeRequest({ title: 'Test' }));
    const json = await res.json();

    expect(res.status).toBe(401);
    expect(json.error).toBe('Unauthorized');
  });

  it('should return 401 when token is invalid', async () => {
    mockExtractBearer.mockReturnValue('bad_token');
    mockAuthBearer.mockResolvedValue(null);

    const res = await POST(makeRequest({ title: 'Test' }, 'bad_token'));
    const json = await res.json();

    expect(res.status).toBe(401);
    expect(json.message).toBe('Invalid or inactive API key');
  });

  it('should return 400 when title is missing', async () => {
    mockExtractBearer.mockReturnValue('gcrm_valid');
    mockAuthBearer.mockResolvedValue({
      userId: 'user-1',
      profile: { id: 'user-1' },
    });

    const res = await POST(makeRequest({}, 'gcrm_valid'));
    const json = await res.json();

    expect(res.status).toBe(400);
    expect(json.error).toBe('Validation failed');
  });

  it('should create a song with only title', async () => {
    mockExtractBearer.mockReturnValue('gcrm_valid');
    mockAuthBearer.mockResolvedValue({
      userId: 'user-1',
      profile: { id: 'user-1' },
    });
    mockFindAll.mockResolvedValue({ data: [], error: null, isLocal: true });
    mockCreate.mockResolvedValue({
      data: { id: 'song-1', title: 'Wonderwall', author: 'Unknown Artist' },
      error: null,
      isLocal: true,
    });

    const res = await POST(makeRequest({ title: 'Wonderwall' }, 'gcrm_valid'));
    const json = await res.json();

    expect(res.status).toBe(201);
    expect(json.meta.action).toBe('created');
    expect(json.song.title).toBe('Wonderwall');
  });

  it('should create a song with full AirPods payload', async () => {
    mockExtractBearer.mockReturnValue('gcrm_valid');
    mockAuthBearer.mockResolvedValue({
      userId: 'user-1',
      profile: { id: 'user-1' },
    });
    mockFindAll.mockResolvedValue({ data: [], error: null, isLocal: true });
    mockCreate.mockResolvedValue({
      data: {
        id: 'song-2',
        title: 'Wonderwall',
        author: 'Oasis',
        duration_ms: 258000,
      },
      error: null,
      isLocal: true,
    });

    const res = await POST(
      makeRequest(
        {
          title: 'Wonderwall',
          author: 'Oasis',
          album: "(What's the Story) Morning Glory?",
          duration_ms: 258000,
        },
        'gcrm_valid'
      )
    );
    const json = await res.json();

    expect(res.status).toBe(201);
    expect(json.meta.action).toBe('created');
    expect(mockCreate).toHaveBeenCalledWith(
      expect.objectContaining({
        title: 'Wonderwall',
        author: 'Oasis',
        level: 'beginner',
        key: 'C',
        duration_ms: 258000,
        category: "(What's the Story) Morning Glory?",
      })
    );
  });

  it('should detect duplicates and return existing song', async () => {
    mockExtractBearer.mockReturnValue('gcrm_valid');
    mockAuthBearer.mockResolvedValue({
      userId: 'user-1',
      profile: { id: 'user-1' },
    });
    mockFindAll.mockResolvedValue({
      data: [
        { id: 'existing-1', title: 'Wonderwall', author: 'Oasis', level: 'intermediate' },
      ],
      error: null,
      isLocal: true,
    });

    const res = await POST(
      makeRequest({ title: 'wonderwall', author: 'oasis' }, 'gcrm_valid')
    );
    const json = await res.json();

    expect(res.status).toBe(200);
    expect(json.meta.action).toBe('already_exists');
    expect(json.song.id).toBe('existing-1');
    expect(mockCreate).not.toHaveBeenCalled();
  });

  it('should handle database creation errors', async () => {
    mockExtractBearer.mockReturnValue('gcrm_valid');
    mockAuthBearer.mockResolvedValue({
      userId: 'user-1',
      profile: { id: 'user-1' },
    });
    mockFindAll.mockResolvedValue({ data: [], error: null, isLocal: true });
    mockCreate.mockResolvedValue({
      data: null,
      error: { message: 'DB error' },
      isLocal: true,
      status: 500,
    });

    const res = await POST(
      makeRequest({ title: 'Wonderwall' }, 'gcrm_valid')
    );
    const json = await res.json();

    expect(res.status).toBe(500);
    expect(json.error).toBe('Failed to create song');
  });
});
