import { createClient } from '@/lib/supabase/server';
import { DashboardPageContent } from '@/components/dashboard/Dashboard';
import { AdminDashboardClient } from '@/components/dashboard/admin/AdminDashboardClient';
import { StudentDashboardClient } from '@/components/dashboard/student/StudentDashboardClient';
import { TeacherDashboardClient } from '@/components/dashboard/teacher/TeacherDashboardClient';
import { getUserWithRolesSSR } from '@/lib/getUserWithRolesSSR';
import { getStudentDashboardData } from '@/app/actions/student/dashboard';
import { getTeacherDashboardData } from '@/app/actions/teacher/dashboard';
import { getCurrentSongOfTheWeek } from '@/app/actions/song-of-the-week';

export default async function DashboardPage({
  searchParams,
}: {
  searchParams: Promise<{ [key: string]: string | string[] | undefined }>;
}) {
  const { view } = await searchParams;
  const { user, isAdmin, isTeacher, isStudent } = await getUserWithRolesSSR();

  if (!user) {
    return <div>Please log in to access the dashboard.</div>;
  }

  // Fetch user profile and Song of the Week in parallel
  const supabase = await createClient();
  const [{ data: profile }, sotw] = await Promise.all([
    supabase.from('profiles').select('full_name').eq('id', user.id).single(),
    getCurrentSongOfTheWeek(),
  ]);

  // For students, check if the SOTW song is already in their repertoire
  let sotwInRepertoire = false;
  if (isStudent && sotw) {
    const { count } = await supabase
      .from('student_repertoire')
      .select('id', { count: 'exact', head: true })
      .eq('student_id', user.id)
      .eq('song_id', sotw.song_id);
    sotwInRepertoire = (count ?? 0) > 0;
  }

  // Admin View (Explicitly requested)
  if (isAdmin && view === 'admin') {
    const [
      { count: totalUsers },
      { count: totalTeachers },
      { count: totalStudents },
      { count: totalSongs },
      { count: totalLessons },
      { data: recentUsers },
    ] = await Promise.all([
      supabase.from('profiles').select('*', { count: 'exact', head: true }),
      supabase.from('user_roles').select('*', { count: 'exact', head: true }).eq('role', 'teacher'),
      supabase.from('user_roles').select('*', { count: 'exact', head: true }).eq('role', 'student'),
      supabase.from('songs').select('*', { count: 'exact', head: true }),
      supabase.from('lessons').select('*', { count: 'exact', head: true }),
      supabase
        .from('profiles')
        .select('id, full_name, email, created_at')
        .order('created_at', { ascending: false })
        .limit(5),
    ]);

    const adminStats = {
      totalUsers: totalUsers || 0,
      totalTeachers: totalTeachers || 0,
      totalStudents: totalStudents || 0,
      totalSongs: totalSongs || 0,
      totalLessons: totalLessons || 0,
      recentUsers: (recentUsers as { id: string; full_name: string; email: string; created_at: string }[] | null) || [],
    };

    return (
      <AdminDashboardClient
        stats={adminStats}
        user={user}
        profile={profile}
        viewMode="admin"
        sotw={sotw}
      />
    );
  }

  // Teacher View (Default for teachers AND admins)
  if (isTeacher || isAdmin) {
    const teacherData = await getTeacherDashboardData();

    return (
      <TeacherDashboardClient
        data={teacherData}
        email={user.email}
        fullName={profile?.full_name}
        isAdmin={isAdmin}
        sotw={sotw}
      />
    );
  }

  // Student Dashboard
  if (isStudent) {
    const studentData = await getStudentDashboardData();
    return (
      <StudentDashboardClient
        data={studentData}
        email={user.email}
        sotw={sotw}
        sotwInRepertoire={sotwInRepertoire}
      />
    );
  }

  return (
    <DashboardPageContent
      email={user.email}
      fullName={profile?.full_name}
      isAdmin={isAdmin}
      isTeacher={isTeacher}
      isStudent={isStudent}
    />
  );
}
