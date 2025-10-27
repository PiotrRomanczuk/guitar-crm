import { createClient } from "@/utils/supabase/clients/server";
import { NextRequest, NextResponse } from "next/server";
import {
  getSongsHandler,
  createSongHandler,
  updateSongHandler,
  deleteSongHandler,
} from "./handlers";

/**
 * Helper to get or create user profile
 */
async function getOrCreateProfile(
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  supabase: any,
  userId: string,
  email: string,
) {
  const { data: profile, error: profileError } = await supabase
    .from("profiles")
    .select("isAdmin, isTeacher, isStudent")
    .eq("user_id", userId)
    .single();

  // If no profile exists, create one with default values
  if (profileError?.code === 'PGRST116') {
    const { data: newProfile, error: createError } = await supabase
      .from("profiles")
      .insert({
        user_id: userId,
        email,
        isAdmin: false,
        isStudent: true,
        isTeacher: false,
        canEdit: false,
      })
      .select("isAdmin, isTeacher, isStudent")
      .single();

    if (createError) {
      console.error("Error creating profile:", createError);
      return null;
    }

    return newProfile;
  }

  if (profileError) {
    console.error("Error fetching profile:", profileError);
    return null;
  }

  return profile;
}

/**
 * Helper to parse and validate query parameters
 */
function parseQueryParams(searchParams: URLSearchParams) {
  return {
    level: searchParams.get("level") || undefined,
    key: searchParams.get("key") || undefined,
    author: searchParams.get("author") || undefined,
    search: searchParams.get("search") || undefined,
    page: parseInt(searchParams.get("page") || "1"),
    limit: parseInt(searchParams.get("limit") || "50"),
    sortBy: searchParams.get("sortBy") || "created_at",
    sortOrder: searchParams.get("sortOrder") || "desc",
  };
}

/**
 * GET /api/song
 * List all songs with filtering, searching, and pagination
 */
export async function GET(request: NextRequest) {
  try {
    const supabase = await createClient();
    const { data: { user } } = await supabase.auth.getUser();

    if (!user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const profile = await getOrCreateProfile(supabase, user.id, user.email || '');
    if (!profile) {
      return NextResponse.json({ error: "Error creating user profile" }, { status: 500 });
    }

    const { searchParams } = new URL(request.url);
    const queryParams = parseQueryParams(searchParams);

    const result = await getSongsHandler(supabase, user, profile, queryParams);

    if ('error' in result) {
      return NextResponse.json({ error: result.error }, { status: result.status });
    }

    const totalPages = Math.ceil((result.count || 0) / queryParams.limit);

    return NextResponse.json({ 
      songs: result.songs, 
      pagination: { 
        page: queryParams.page, 
        limit: queryParams.limit, 
        total: result.count || 0, 
        totalPages 
      }
    }, { status: 200 });
  } catch (error) {
    console.error("GET /api/song error:", error);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}

/**
 * POST /api/song
 * Create a new song (requires teacher or admin role)
 */
export async function POST(request: NextRequest) {
  try {
    const supabase = await createClient();
    const { data: { user } } = await supabase.auth.getUser();

    if (!user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const profile = await getOrCreateProfile(supabase, user.id, user.email || '');
    if (!profile) {
      return NextResponse.json({ error: "Error creating user profile" }, { status: 500 });
    }

    const body = await request.json();
    const result = await createSongHandler(supabase, user, profile, body);

    if (result.error) {
      return NextResponse.json({ error: result.error }, { status: result.status });
    }

    return NextResponse.json(result.song, { status: result.status });
  } catch (error) {
    console.error("POST /api/song error:", error);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}

/**
 * PUT /api/song?id=songId
 * Update a song (requires teacher or admin role)
 */
export async function PUT(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const songId = searchParams.get("id");

    if (!songId) {
      return NextResponse.json({ error: "Song ID is required" }, { status: 400 });
    }

    const supabase = await createClient();
    const { data: { user } } = await supabase.auth.getUser();

    if (!user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const profile = await getOrCreateProfile(supabase, user.id, user.email || '');
    if (!profile) {
      return NextResponse.json({ error: "Error creating user profile" }, { status: 500 });
    }

    const body = await request.json();
    const result = await updateSongHandler(supabase, user, profile, songId, body);

    if (result.error) {
      return NextResponse.json({ error: result.error }, { status: result.status });
    }

    return NextResponse.json(result.song, { status: result.status });
  } catch (error) {
    console.error("PUT /api/song error:", error);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}

/**
 * DELETE /api/song?id=songId
 * Delete a song (requires teacher or admin role)
 */
export async function DELETE(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const songId = searchParams.get("id");

    if (!songId) {
      return NextResponse.json({ error: "Song ID is required" }, { status: 400 });
    }

    const supabase = await createClient();
    const { data: { user } } = await supabase.auth.getUser();

    if (!user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const profile = await getOrCreateProfile(supabase, user.id, user.email || '');
    if (!profile) {
      return NextResponse.json({ error: "Error creating user profile" }, { status: 500 });
    }

    const result = await deleteSongHandler(supabase, user, profile, songId);

    if (result.error) {
      return NextResponse.json({ error: result.error }, { status: result.status });
    }

    return NextResponse.json({ success: result.success }, { status: result.status });
  } catch (error) {
    console.error("DELETE /api/song error:", error);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
} 