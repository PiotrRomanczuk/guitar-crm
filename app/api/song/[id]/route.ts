import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";

export async function GET(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> },
) {
  try {
    const { id } = await params;
    

    const supabase = await createClient();
    
    // Check authentication
    const {
      data: { user },
    } = await supabase.auth.getUser();

    if (!user) {
      
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { data: song, error } = await supabase
      .from("songs")
      .select("*")
      .eq("id", id)
      .single();

    

    if (error || !song) {
      
      return NextResponse.json({ error: "Song not found" }, { status: 404 });
    }

    
    return NextResponse.json(song);
  } catch (error) {
    console.error(`Error in song API:`, error);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}
