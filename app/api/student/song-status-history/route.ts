import { NextResponse } from 'next/server';
import { createClient } from '@/lib/supabase/server';

export async function GET(req: Request) {
  try {
    const supabase = await createClient();

    // Get authenticated user
    const {
      data: { user },
      error: authError,
    } = await supabase.auth.getUser();

    if (authError || !user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { searchParams } = new URL(req.url);
    const studentId = searchParams.get('studentId');
    const limit = parseInt(searchParams.get('limit') || '50');

    // Check if user is admin/teacher or requesting their own data
    const { data: userRoles } = await supabase
      .from('user_roles')
      .select('role')
      .eq('user_id', user.id);

    const isAdminOrTeacher = userRoles?.some((ur) => ['admin', 'teacher'].includes(ur.role));
    const targetStudentId = studentId || user.id;

    // If not admin/teacher, can only see own data
    if (!isAdminOrTeacher && targetStudentId !== user.id) {
      return NextResponse.json({ error: 'Forbidden' }, { status: 403 });
    }

    // Get comprehensive status history with song details
    const { data, error } = await supabase
      .from('song_status_history')
      .select(
        `
        id,
        previous_status,
        new_status,
        changed_at,
        notes,
        song:songs(
          id,
          title,
          author,
          level,
          key,
          cover_image_url
        )
      `
      )
      .eq('student_id', targetStudentId)
      .order('changed_at', { ascending: false })
      .limit(limit);

    if (error) {
      console.error('Error fetching status history:', error);
      return NextResponse.json({ error: 'Failed to fetch status history' }, { status: 500 });
    }

    // Group by song for summary view
    const songSummaries = data.reduce((acc: any, change: any) => {
      // Note: Supabase joins return single objects, not arrays for single relationships
      const song = change.song;
      const songId = song?.id;

      if (!songId || !song) return acc;

      if (!acc[songId]) {
        acc[songId] = {
          song: song,
          totalChanges: 0,
          currentStatus: change.new_status,
          firstChange: change.changed_at,
          lastChange: change.changed_at,
          recentChanges: [],
        };
      }

      acc[songId].totalChanges++;
      acc[songId].recentChanges.push(change);

      // Update first/last change dates
      if (change.changed_at > acc[songId].lastChange) {
        acc[songId].currentStatus = change.new_status;
        acc[songId].lastChange = change.changed_at;
      }
      if (change.changed_at < acc[songId].firstChange) {
        acc[songId].firstChange = change.changed_at;
      }

      return acc;
    }, {} as Record<string, any>);

    return NextResponse.json({
      data,
      summary: Object.values(songSummaries),
      totalChanges: data.length,
    });
  } catch (error) {
    console.error('Error in status history fetch:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
