import { createClient } from "@/lib/supabase/server";
import { NextRequest, NextResponse } from "next/server";
import { SongUpdateSchema } from "@/schemas/SongSchema";

export async function PUT(request: NextRequest) {
  try {
    const supabase = await createClient();
    const body = await request.json();

    // Validate the request body
    const validationResult = SongUpdateSchema.safeParse(body);
    if (!validationResult.success) {
      return NextResponse.json(
        { 
          error: "Validation failed", 
          details: validationResult.error.format() 
        },
        { status: 400 }
      );
    }

    const validatedData = validationResult.data;

    // First check if the song exists
    const { data: existingData } = await supabase
      .from("songs")
      .select()
      .eq("id", validatedData.id)
      .single();

    // 

    if (!existingData) {
      console.error(`Song with ID ${validatedData.id} not found in database`);
      return NextResponse.json(
        { error: "No song found with the specified ID" },
        { status: 404 },
      );
    }

    // 

    // Create a clean update object with only the fields we want to update
    const updateData = {
      title: validatedData.title,
      author: validatedData.author,
      level: validatedData.level,
      key: validatedData.key,
      chords: validatedData.chords,
      ultimate_guitar_link: validatedData.ultimate_guitar_link,
      updated_at: new Date().toISOString(),
    };

    // 

    const { data, error } = await supabase
      .from("songs")
      .update(updateData)
      .eq("id", validatedData.id)
      .select();

    if (error) {
      console.error("Error updating song", error);
      return NextResponse.json({ error: error.message }, { status: 400 });
    }

    // Check if we got any data back (data will be an array)
    if (!data || data.length === 0) {
      console.error("No song was updated. ID:", validatedData.id);
      return NextResponse.json({ error: "No song was updated" }, { status: 404 });
    }

    const updatedSong = data[0]; // Get the first (and should be only) updated song
    // 

    // 
    return NextResponse.json({ data: updatedSong }, { status: 200 });
  } catch (error) {
    console.error("Error in song update API:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}
