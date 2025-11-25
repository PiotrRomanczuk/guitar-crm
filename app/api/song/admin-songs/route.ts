import { NextResponse } from 'next/server';
import { createClient } from '@/lib/supabase/server';

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const userId = searchParams.get('userId');
    const level = searchParams.get('level');

    if (!userId) {
      return NextResponse.json({ error: 'User ID is required' }, { status: 400 });
    }

    const supabase = await createClient();

    // 1. Verify user has teacher or admin role
    const { data: roles, error: rolesError } = await supabase
      .from('user_roles')
      .select('role')
      .eq('user_id', userId)
      .in('role', ['admin', 'teacher']);

    if (rolesError || !roles || roles.length === 0) {
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
