import { NextResponse } from 'next/server';
import { createClient } from '@/lib/supabase/server';

export async function POST(request: Request) {
  const supabase = await createClient();

  // Check authentication
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  // Check permissions
  const { data: profile } = await supabase
    .from('user_overview')
    .select('is_admin, is_teacher')
    .eq('user_id', user.id)
    .single();

  if (!profile?.is_admin && !profile?.is_teacher) {
    return NextResponse.json({ error: 'Forbidden' }, { status: 403 });
  }

  try {
    const body = await request.json();
    const { matchId } = body;

    if (!matchId) {
      return NextResponse.json({ error: 'matchId is required' }, { status: 400 });
    }

    // Update the match status to rejected
    const { error } = await supabase
      .from('spotify_matches')
      .update({
        status: 'rejected',
        reviewed_at: new Date().toISOString(),
        reviewed_by: user.id,
      })
      .eq('id', matchId);

    if (error) {
      throw error;
    }

    return NextResponse.json({
      success: true,
      message: 'Match rejected',
    });
  } catch (error) {
    console.error('Failed to reject match:', error);
    return NextResponse.json(
      {
        error: 'Failed to reject match',
        details: error instanceof Error ? error.message : 'Unknown error',
      },
      { status: 500 }
    );
  }
}
