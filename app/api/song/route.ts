// TODO: File exceeds 300 lines (currently 303). Needs refactoring:
//   - Extract GET handler logic to separate handler file (similar to lessons/handlers.ts pattern)
//   - Extract POST/PUT/DELETE handlers to separate functions
//   - Move Supabase client creation to shared utility
//   - Consider splitting by HTTP method into separate route files

import { NextRequest, NextResponse } from 'next/server';
import { cookies } from 'next/headers';
import { createServerClient } from '@supabase/ssr';
import { Database } from '@/types/database.types.generated';
import {
  getSongsHandler,
  createSongHandler,
  updateSongHandler,
  deleteSongHandler,
} from './handlers';

/**
 * Helper to get or create user profile
 */
async function getOrCreateProfile(
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  supabase: any,
  userId: string,
  email: string
) {
  const { data: profile, error: profileError } = await supabase
    .from('profiles')
    .select('is_admin, is_teacher, is_student')
    .eq('id', userId)
    .single();

  // If no profile exists, create one with default values
  if (profileError?.code === 'PGRST116') {
    const { data: newProfile, error: createError } = await supabase
      .from('profiles')
      .insert({
        id: userId,
        email,
        is_admin: false,
        is_student: true,
        is_teacher: false,
      })
      .select('is_admin, is_teacher, is_student')
      .single();

    if (createError) {
      console.error('Error creating profile:', createError);
      return null;
    }

    return {
      isAdmin: newProfile.is_admin,
      isTeacher: newProfile.is_teacher,
      isStudent: newProfile.is_student,
    };
  }

  if (profileError) {
    console.error('Error fetching profile:', profileError);
    // Return a default profile for now to unblock testing
    return { isAdmin: false, isTeacher: false, isStudent: true };
  }

  return {
    isAdmin: profile.is_admin,
    isTeacher: profile.is_teacher,
    isStudent: profile.is_student,
  };
}

/**
 * Helper to parse and validate query parameters
 */
function parseQueryParams(searchParams: URLSearchParams) {
  return {
    level: searchParams.get('level') || undefined,
    key: searchParams.get('key') || undefined,
    author: searchParams.get('author') || undefined,
    search: searchParams.get('search') || undefined,
    page: parseInt(searchParams.get('page') || '1'),
    limit: parseInt(searchParams.get('limit') || '50'),
    sortBy: searchParams.get('sortBy') || 'created_at',
    sortOrder: searchParams.get('sortOrder') || 'desc',
  };
}

/**
 * GET /api/song
 * List all songs with filtering, searching, and pagination
 */
export async function GET(request: NextRequest) {
  try {
    const cookieStore = await cookies();
    const supabase = createServerClient<Database>(
      process.env.NEXT_PUBLIC_SUPABASE_URL!,
      process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
      {
        cookies: {
          getAll: () => cookieStore.getAll(),
          setAll: (cookiesToSet) => {
            try {
              cookiesToSet.forEach(({ name, value, options }) =>
                cookieStore.set(name, value, options)
              );
            } catch {
              // Ignored
            }
          },
        },
      }
    );
    const {
      data: { user },
    } = await supabase.auth.getUser();

    if (!user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const profile = await getOrCreateProfile(supabase, user.id, user.email || '');
    if (!profile) {
      return NextResponse.json({ error: 'Error creating user profile' }, { status: 500 });
    }

    const { searchParams } = new URL(request.url);
    const queryParams = parseQueryParams(searchParams);

    const result = await getSongsHandler(supabase, user, profile, queryParams);

    if ('error' in result) {
      return NextResponse.json({ error: result.error }, { status: result.status });
    }

    const totalPages = Math.ceil((result.count || 0) / queryParams.limit);

    return NextResponse.json(
      {
        songs: result.songs,
        pagination: {
          page: queryParams.page,
          limit: queryParams.limit,
          total: result.count || 0,
          totalPages,
        },
      },
      { status: 200 }
    );
  } catch (error) {
    console.error('GET /api/song error:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}

/**
 * POST /api/song
 * Create a new song (requires teacher or admin role)
 */
export async function POST(request: NextRequest) {
  console.log('🎵 [BACKEND] POST /api/song - Request received');

  try {
    const cookieStore = await cookies();
    console.log('🎵 [BACKEND] Cookies retrieved, count:', cookieStore.getAll().length);

    const supabase = createServerClient<Database>(
      process.env.NEXT_PUBLIC_SUPABASE_URL!,
      process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
      {
        cookies: {
          getAll: () => cookieStore.getAll(),
          setAll: (cookiesToSet) => {
            try {
              cookiesToSet.forEach(({ name, value, options }) =>
                cookieStore.set(name, value, options)
              );
            } catch {
              // Ignored
            }
          },
        },
      }
    );
    console.log('🎵 [BACKEND] Supabase client created');

    const {
      data: { user },
    } = await supabase.auth.getUser();
    console.log('🎵 [BACKEND] User retrieved:', user ? { id: user.id, email: user.email } : 'null');

    if (!user) {
      console.error('🎵 [BACKEND] No user - returning 401');
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const profile = await getOrCreateProfile(supabase, user.id, user.email || '');
    console.log('🎵 [BACKEND] Profile retrieved:', profile);

    if (!profile) {
      console.error('🎵 [BACKEND] Failed to get/create profile');
      return NextResponse.json({ error: 'Error creating user profile' }, { status: 500 });
    }

    const body = await request.json();
    console.log('🎵 [BACKEND] Request body:', body);

    const result = await createSongHandler(supabase, user, profile, body);
    console.log('🎵 [BACKEND] Handler result:', {
      status: result.status,
      hasError: !!result.error,
      hasSong: !!result.song,
    });

    if (result.error) {
      console.error('🎵 [BACKEND] createSongHandler returned error:', result.error);
      return NextResponse.json({ error: result.error }, { status: result.status });
    }

    console.log('🎵 [BACKEND] Success! Returning song');
    return NextResponse.json(result.song, { status: result.status });
  } catch (error) {
    console.error('🎵 [BACKEND] POST /api/song error:', error);
    const errorMessage = error instanceof Error ? error.message : 'Unknown error';
    const errorStack = error instanceof Error ? error.stack : '';
    console.error('🎵 [BACKEND] Error details:', { message: errorMessage, stack: errorStack });
    return NextResponse.json(
      {
        error: 'Internal server error',
        details: process.env.NODE_ENV === 'development' ? errorMessage : undefined,
      },
      { status: 500 }
    );
  }
}

/**
 * PUT /api/song?id=songId
 * Update a song (requires teacher or admin role)
 */
export async function PUT(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const songId = searchParams.get('id');

    if (!songId) {
      return NextResponse.json({ error: 'Song ID is required' }, { status: 400 });
    }

    const cookieStore = await cookies();
    const supabase = createServerClient<Database>(
      process.env.NEXT_PUBLIC_SUPABASE_URL!,
      process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
      {
        cookies: {
          getAll: () => cookieStore.getAll(),
          setAll: (cookiesToSet) => {
            try {
              cookiesToSet.forEach(({ name, value, options }) =>
                cookieStore.set(name, value, options)
              );
            } catch {
              // Ignored
            }
          },
        },
      }
    );
    const {
      data: { user },
    } = await supabase.auth.getUser();

    if (!user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const profile = await getOrCreateProfile(supabase, user.id, user.email || '');
    if (!profile) {
      return NextResponse.json({ error: 'Error creating user profile' }, { status: 500 });
    }

    const body = await request.json();
    const result = await updateSongHandler(supabase, user, profile, songId, body);

    if (result.error) {
      return NextResponse.json({ error: result.error }, { status: result.status });
    }

    return NextResponse.json(result.song, { status: result.status });
  } catch (error) {
    console.error('PUT /api/song error:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}

/**
 * DELETE /api/song?id=songId
 * Delete a song (requires teacher or admin role)
 */
export async function DELETE(request: NextRequest) {
  console.log('[API] DELETE /api/song - Request received');
  try {
    const { searchParams } = new URL(request.url);
    const songId = searchParams.get('id');
    console.log('[API] DELETE /api/song - Song ID:', songId);

    if (!songId) {
      return NextResponse.json({ error: 'Song ID is required' }, { status: 400 });
    }

    const cookieStore = await cookies();
    console.log('[API] DELETE /api/song - Cookies count:', cookieStore.getAll().length);

    const supabase = createServerClient<Database>(
      process.env.NEXT_PUBLIC_SUPABASE_URL!,
      process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
      {
        cookies: {
          getAll: () => cookieStore.getAll(),
          setAll: (cookiesToSet) => {
            try {
              cookiesToSet.forEach(({ name, value, options }) =>
                cookieStore.set(name, value, options)
              );
            } catch {
              // Ignored
            }
          },
        },
      }
    );
    const {
      data: { user },
    } = await supabase.auth.getUser();
    console.log('[API] DELETE /api/song - User:', user?.id);

    if (!user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const profile = await getOrCreateProfile(supabase, user.id, user.email || '');
    console.log('[API] DELETE /api/song - Profile found:', !!profile);

    if (!profile) {
      return NextResponse.json({ error: 'Error creating user profile' }, { status: 500 });
    }

    const result = await deleteSongHandler(supabase, user, profile, songId);
    console.log('[API] DELETE /api/song - Handler result:', result);

    if (result.error) {
      return NextResponse.json({ error: result.error }, { status: result.status });
    }

    return NextResponse.json(
      {
        success: result.success,
        cascadeInfo: result.cascadeInfo,
      },
      { status: result.status }
    );
  } catch (error) {
    console.error('DELETE /api/song error:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
