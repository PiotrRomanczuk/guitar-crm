import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";
import { Song } from "@/types/Song";
import { AdminFavoritesQuerySchema } from "@/schemas/CommonSchema";

export async function GET(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url);
    
    // Validate query parameters
    const queryValidation = AdminFavoritesQuerySchema.safeParse({
      userId: searchParams.get("userId"),
    });

    if (!queryValidation.success) {
      return NextResponse.json(
        { 
          error: 'Invalid query parameters', 
          details: queryValidation.error.format() 
        },
        { status: 400 }
      );
    }

    const { userId } = queryValidation.data;

    const supabase = await createClient();
    const { data: profile, error: profileError } = await supabase
      .from("profiles")
      .select("is_admin")
      .eq("user_id", userId)
      .single();
    
    if (profileError) {
      return NextResponse.json(
        { error: "Error fetching user profile" },
        { status: 500 },
      );
    }
    
    if (!profile?.is_admin) {
      return NextResponse.json(
        { error: "User is not an admin" },
        { status: 403 },
      );
    }
    
    const { data, error } = await supabase
      .from("user_favorites")
      .select("song:song_id(*), profiles!inner(isAdmin, user_id)")
      .eq("user_id", userId)
      .eq("profiles.isAdmin", true);
    
    if (error) {
      return NextResponse.json(
        { error: "Error fetching songs: " + error.message },
        { status: 500 },
      );
    }
    
    const songs = data?.map((fav: unknown) => (fav as { song: Song }).song) || [];
    return NextResponse.json(songs);
  } catch (error) {
    console.error("Error in admin-favorites API:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}
