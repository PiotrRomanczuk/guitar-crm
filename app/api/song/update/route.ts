import { createClient } from "@/lib/supabase/server";
import { NextRequest, NextResponse } from "next/server";
import { SongUpdateSchema } from "@/schemas/SongSchema";

export async function PUT(request: NextRequest) {
  try {
    const supabase = await createClient();

    const {
      data: { user },
    } = await supabase.auth.getUser();

    if (!user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { data: profile } = await supabase
      .from("profiles")
      .select("is_admin, is_teacher")
      .eq("id", user.id)
      .single();

    if (!profile?.is_admin && !profile?.is_teacher) {
      return NextResponse.json({ error: "Forbidden" }, { status: 403 });
    }

    let body: unknown;
    try {
      body = await request.json();
    } catch {
      return NextResponse.json({ error: "Invalid JSON body" }, { status: 400 });
    }

    const parsed = SongUpdateSchema.safeParse(body);
    if (!parsed.success) {
      return NextResponse.json(
        { error: "Validation failed", details: parsed.error.flatten().fieldErrors },
        { status: 400 },
      );
    }

    const { id, ...updateFields } = parsed.data;

    const { data: existingData } = await supabase
      .from("songs")
      .select("id")
      .eq("id", id)
      .single();

    if (!existingData) {
      return NextResponse.json(
        { error: "No song found with the specified ID" },
        { status: 404 },
      );
    }

    const { data: updatedSong, error } = await supabase
      .from("songs")
      .update({ ...updateFields, updated_at: new Date().toISOString() })
      .eq("id", id)
      .select()
      .single();

    if (error) {
      console.error("Error updating song", error);
      return NextResponse.json({ error: error.message }, { status: 400 });
    }

    return NextResponse.json({ data: updatedSong }, { status: 200 });
  } catch (error) {
    console.error("Unexpected error in song update API:", error);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}
