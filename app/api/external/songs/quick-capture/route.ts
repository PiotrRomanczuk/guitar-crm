import { NextRequest, NextResponse } from 'next/server';
import { z } from 'zod';
import { db } from '@/lib/api/unified-db';
import {
  extractBearerToken,
  authenticateWithBearerToken,
} from '@/lib/bearer-auth';

/**
 * Quick-capture schema — only title is required.
 * Designed for Apple Shortcuts "Get Current Song" which provides
 * title, artist, album, and duration.
 */
const QuickCaptureSchema = z.object({
  title: z.string().min(1, 'Title is required').max(200),
  author: z.string().max(100).optional(),
  album: z.string().max(200).optional(),
  duration_ms: z.number().int().min(0).optional(),
  spotify_link_url: z.string().url().optional(),
  notes: z.string().max(500).optional(),
});

export type QuickCaptureInput = z.infer<typeof QuickCaptureSchema>;

/**
 * POST /api/external/songs/quick-capture
 *
 * Lightweight endpoint for capturing songs from Apple Shortcuts.
 * Only requires a title. Handles duplicate detection by matching
 * title + author (case-insensitive). Returns existing song if found.
 *
 * Example Apple Shortcut payload:
 * {
 *   "title": "Wonderwall",
 *   "author": "Oasis",
 *   "album": "(What's the Story) Morning Glory?",
 *   "duration_ms": 258000
 * }
 */
export async function POST(request: NextRequest) {
  try {
    const token = extractBearerToken(
      request.headers.get('Authorization') ?? undefined
    );
    if (!token) {
      return NextResponse.json(
        { error: 'Unauthorized', message: 'Bearer token required' },
        { status: 401 }
      );
    }

    const auth = await authenticateWithBearerToken(token);
    if (!auth) {
      return NextResponse.json(
        { error: 'Unauthorized', message: 'Invalid or inactive API key' },
        { status: 401 }
      );
    }

    const body = await request.json();
    const parsed = QuickCaptureSchema.safeParse(body);

    if (!parsed.success) {
      return NextResponse.json(
        {
          error: 'Validation failed',
          details: parsed.error.flatten().fieldErrors,
        },
        { status: 400 }
      );
    }

    const { title, author, album, duration_ms, spotify_link_url, notes } =
      parsed.data;

    // Check for duplicates (case-insensitive title + author match)
    const existing = await db.songs.findAll({
      filter: {},
      limit: 100,
    });

    if (existing.data) {
      const duplicate = existing.data.find((song) => {
        const titleMatch =
          song.title?.toLowerCase().trim() === title.toLowerCase().trim();
        const authorMatch =
          !author ||
          !song.author ||
          song.author.toLowerCase().trim() === author.toLowerCase().trim();
        return titleMatch && authorMatch;
      });

      if (duplicate) {
        return NextResponse.json(
          {
            song: duplicate,
            meta: {
              action: 'already_exists',
              message: `"${duplicate.title}" by ${duplicate.author ?? 'Unknown'} is already in your library`,
            },
          },
          { status: 200 }
        );
      }
    }

    // Build the song object with sensible defaults
    const songData: Record<string, unknown> = {
      title: title.trim(),
      author: author?.trim() ?? 'Unknown Artist',
      level: 'beginner',
      key: 'C',
      short_title: title.length > 50 ? title.substring(0, 47) + '...' : null,
      category: album?.trim() ?? null,
      duration_ms: duration_ms ?? null,
      spotify_link_url: spotify_link_url ?? null,
      notes: notes ?? `Captured from AirPods on ${new Date().toLocaleDateString()}`,
    };

    const result = await db.songs.create(songData);

    if (result.error) {
      return NextResponse.json(
        {
          error: 'Failed to create song',
          details: result.error.message,
          database: result.isLocal ? 'local' : 'remote',
        },
        { status: result.status || 500 }
      );
    }

    return NextResponse.json(
      {
        song: result.data,
        meta: {
          action: 'created',
          message: `"${title}" added to your library`,
          database: result.isLocal ? 'local' : 'remote',
        },
      },
      { status: 201 }
    );
  } catch (error) {
    console.error('[Quick Capture] Error:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}
