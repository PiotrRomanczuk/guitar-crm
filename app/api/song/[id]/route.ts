import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";
import { RouteParamsSchema } from "@/schemas/CommonSchema";
import { z } from "zod";

export async function GET(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> },
) {
  try {
    const paramsData = await params;
    
    // Validate route parameters
    const validationResult = RouteParamsSchema.safeParse(paramsData);
    if (!validationResult.success) {
      return NextResponse.json(
        { 
          error: "Invalid ID format", 
          details: validationResult.error.format() 
        }, 
        { status: 400 }
      );
    }
    
    const { id } = validationResult.data;

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
    if (error instanceof z.ZodError) {
      return NextResponse.json(
        { error: "Validation error", details: error.errors },
        { status: 400 }
      );
    }
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}
