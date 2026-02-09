import { NextResponse } from 'next/server';
import { createClient } from '@/lib/supabase/server';

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const level = searchParams.get('level');
    const supabase = await createClient();

    // Get authenticated user
    const {
      data: { user },
      error: authError,
    } = await supabase.auth.getUser();
    if (authError || !user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }
    const userId = user.id;

    // 1. Verify user has teacher or admin role via profiles boolean flags
    const { data: profile, error: profileError } = await supabase
      .from('profiles')
      .select('is_admin, is_teacher')
      .eq('id', userId)
      .single();

    if (profileError || !profile || (!profile.is_admin && !profile.is_teacher)) {
      return NextResponse.json({ error: 'Insufficient permissions' }, { status: 403 });
    }

    // 2. Fetch all songs (teachers and admins can see all)
    let query = supabase.from('songs').select('*');

    if (level) {
      query = query.eq('level', level as 'beginner' | 'intermediate' | 'advanced');
    }

    const { data: songs, error: songsError } = await query;

    if (songsError) {
      return NextResponse.json({ error: 'Failed to fetch songs' }, { status: 500 });
    }

    return NextResponse.json(songs || []);
  } catch (error) {
    console.error('Error in admin-songs route:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
