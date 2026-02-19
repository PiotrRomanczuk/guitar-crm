import { createClient } from '@/lib/supabase/server';
import { getUserWithRolesSSR } from '@/lib/getUserWithRolesSSR';
import { StudentStatsPageClient } from '@/components/dashboard/student/StudentStatsPageClient';
import { redirect } from 'next/navigation';

export default async function StudentStatsPage() {
  const { user, isStudent, isAdmin, isTeacher } = await getUserWithRolesSSR();

  if (!user) {
    redirect('/sign-in');
  }

  // Only students (who are not also admin/teacher) can access this page
  if (!isStudent || isAdmin || isTeacher) {
    redirect('/dashboard');
  }

  const supabase = await createClient();
  const now = new Date().toISOString();

  // Fetch comprehensive student statistics
  const [
    { count: totalSongs },
    { count: completedLessons },
    { count: totalLessons },
    { count: completedAssignments },
    { count: totalAssignments },
    { data: recentLessons },
    { data: songProgress },
  ] = await Promise.all([
    // Total songs assigned to student
    supabase
      .from('songs')
      .select('lesson_songs!inner(lessons!inner(student_id))', { count: 'exact', head: true })
      .eq('lesson_songs.lessons.student_id', user.id),

    // Completed lessons
    supabase
      .from('lessons')
      .select('*', { count: 'exact', head: true })
      .eq('student_id', user.id)
      .lt('scheduled_at', now)
      .eq('status', 'COMPLETED'),

    // Total lessons
    supabase.from('lessons').select('*', { count: 'exact', head: true }).eq('student_id', user.id),

    // Completed assignments
    supabase
      .from('assignments')
      .select('*', { count: 'exact', head: true })
      .eq('student_id', user.id)
      .eq('status', 'completed'),

    // Total assignments
    supabase
      .from('assignments')
      .select('*', { count: 'exact', head: true })
      .eq('student_id', user.id),

    // Recent lesson history
    supabase
      .from('lessons')
      .select('id, scheduled_at, status, notes, lesson_teacher_number')
      .eq('student_id', user.id)
      .order('scheduled_at', { ascending: false })
      .limit(10),

    // Song progress by status
    supabase
      .from('student_songs')
      .select(
        `
        status,
        songs!inner (title, artist, level)
      `
      )
      .eq('student_id', user.id),
  ]);

  const stats = {
    totalSongs: totalSongs || 0,
    completedLessons: completedLessons || 0,
    totalLessons: totalLessons || 0,
    completedAssignments: completedAssignments || 0,
    totalAssignments: totalAssignments || 0,
    attendanceRate: totalLessons ? Math.round(((completedLessons || 0) / totalLessons) * 100) : 0,
    assignmentCompletionRate: totalAssignments
      ? Math.round(((completedAssignments || 0) / totalAssignments) * 100)
      : 0,
    recentLessons: recentLessons || [],
    songProgress: (songProgress || []).map((item: { status: string; songs: unknown }) => ({
      status: item.status,
      songs: Array.isArray(item.songs) ? item.songs[0] || null : item.songs,
    })),
  };

  return <StudentStatsPageClient stats={stats} />;
}
