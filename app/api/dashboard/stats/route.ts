import { createClient } from '@/lib/supabase/server';
import { NextRequest, NextResponse } from 'next/server';

/**
 * GET /api/dashboard/stats
 * Returns dashboard statistics based on user role
 */
export async function GET(request: NextRequest) {
  console.log('[API /api/dashboard/stats] Route handler called');
  console.log('[API /api/dashboard/stats] Request URL:', request.url);

  try {
    const supabase = await createClient();
    console.log('[API /api/dashboard/stats] Supabase client created');

    const {
      data: { user },
    } = await supabase.auth.getUser();

    console.log(
      '[API /api/dashboard/stats] User check:',
      user ? `Found user: ${user.id}` : 'No user'
    );

    if (!user) {
      console.log('[API /api/dashboard/stats] Returning 401 - Unauthorized');
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    // Get user profile to check roles
    console.log('[API /api/dashboard/stats] Fetching profile for user:', user.id);
    const { data: profile, error: profileError } = await supabase
      .from('profiles')
      .select('is_admin, is_teacher, is_student')
      .eq('id', user.id)
      .single();

    console.log('[API /api/dashboard/stats] Profile result:', { profile, error: profileError });
    if (!profile) {
      console.log('[API /api/dashboard/stats] Returning 404 - Profile not found');
      return NextResponse.json({ error: 'Profile not found' }, { status: 404 });
    }

    // Admin stats
    if (profile.is_admin) {
      console.log('[API /api/dashboard/stats] User is admin, fetching admin stats');
      const [
        { count: totalUsers },
        { count: totalTeachers },
        { count: totalStudents },
        { count: totalSongs },
        { count: totalLessons },
      ] = await Promise.all([
        supabase.from('profiles').select('*', { count: 'exact', head: true }),
        supabase
          .from('profiles')
          .select('*', { count: 'exact', head: true })
          .eq('is_teacher', true),
        supabase
          .from('profiles')
          .select('*', { count: 'exact', head: true })
          .eq('is_student', true),
        supabase.from('songs').select('*', { count: 'exact', head: true }),
        supabase.from('lessons').select('*', { count: 'exact', head: true }),
      ]);

      console.log('[API /api/dashboard/stats] Admin stats:', {
        totalUsers,
        totalTeachers,
        totalStudents,
        totalSongs,
        totalLessons,
      });
      return NextResponse.json({
        role: 'admin',
        stats: {
          totalUsers: totalUsers || 0,
          totalTeachers: totalTeachers || 0,
          totalStudents: totalStudents || 0,
          totalSongs: totalSongs || 0,
          totalLessons: totalLessons || 0,
        },
      });
    } // Teacher stats
    if (profile.is_teacher) {
      console.log('[API /api/dashboard/stats] User is teacher, fetching teacher stats');
      const [{ count: myStudents }, { count: activeLessons }, { count: songsLibrary }] =
        await Promise.all([
          supabase
            .from('lessons')
            .select('*', { count: 'exact', head: true })
            .eq('teacher_id', user.id),
          supabase
            .from('lessons')
            .select('*', { count: 'exact', head: true })
            .eq('teacher_id', user.id)
            .eq('status', 'IN_PROGRESS'),
          supabase.from('songs').select('*', { count: 'exact', head: true }),
        ]);

      console.log('[API /api/dashboard/stats] Teacher stats:', {
        myStudents,
        activeLessons,
        songsLibrary,
      });
      return NextResponse.json({
        role: 'teacher',
        stats: {
          myStudents: myStudents || 0,
          activeLessons: activeLessons || 0,
          songsLibrary: songsLibrary || 0,
          studentProgress: 0, // TODO: Calculate average progress
        },
      });
    }

    // Student stats
    if (profile.is_student) {
      console.log('[API /api/dashboard/stats] User is student, fetching student stats');

      // Get lessons for this student
      const { data: lessons } = await supabase
        .from('lessons')
        .select('id, teacher_id, lesson_teacher_number')
        .eq('student_id', user.id);

      const lessonIds = lessons?.map((l) => l.id) || [];

      // Get songs count for these lessons
      const { count: songsLearning } = await supabase
        .from('lesson_songs')
        .select('*', { count: 'exact', head: true })
        .in('lesson_id', lessonIds);

      const uniqueTeachers = new Set(lessons?.map((l) => l.teacher_id)).size;
      const lessonsDone = lessons?.length || 0;

      console.log('[API /api/dashboard/stats] Student stats:', {
        uniqueTeachers,
        lessonsDone,
        songsLearning,
      });
      return NextResponse.json({
        role: 'student',
        stats: {
          myTeacher: uniqueTeachers || 0,
          lessonsDone: lessonsDone,
          songsLearning: songsLearning || 0,
          progress: 0, // TODO: Calculate progress percentage
        },
      });
    }

    console.log('[API /api/dashboard/stats] User has no specific role, returning empty stats');
    return NextResponse.json({
      role: 'user',
      stats: {},
    });
  } catch (error) {
    console.error('[API /api/dashboard/stats] ERROR:', error);
    console.error(
      '[API /api/dashboard/stats] Error stack:',
      error instanceof Error ? error.stack : 'No stack trace'
    );
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
