import { createClient } from '@/lib/supabase/server';
import { DashboardPageContent } from '@/components/dashboard/Dashboard';
import { StudentDashboardClient } from '@/components/dashboard/student/StudentDashboardClient';
import { TeacherDashboardClient } from '@/components/dashboard/teacher/TeacherDashboardClient';
import { getUserWithRolesSSR } from '@/lib/getUserWithRolesSSR';
import { getStudentDashboardData } from '@/app/actions/student/dashboard';
import { getTeacherDashboardData } from '@/app/actions/teacher/dashboard';

export default async function DashboardPage() {
  const { user, isAdmin, isTeacher, isStudent } = await getUserWithRolesSSR();

  if (!user) {
    return <div>Please log in to access the dashboard.</div>;
  }

  // Fetch user profile for full_name
  const supabase = await createClient();
  const { data: profile } = await supabase
    .from('profiles')
    .select('full_name')
    .eq('id', user.id)
    .single();

  // Show admin dashboard for admin users AND teachers (for now, same view)
  if (isAdmin || isTeacher) {
    const {
      data: { session },
    } = await supabase.auth.getSession();

    // Fetch Admin Stats
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
      recentUsers: recentUsers || [],
    };

    // Fetch Teacher Dashboard Data (for the main UI)
    const teacherData = await getTeacherDashboardData();

    return (
      <TeacherDashboardClient
        data={teacherData}
        email={user.email}
        fullName={profile?.full_name}
        adminStats={adminStats}
        token={session?.access_token}
      />
    );
  }

  // Show student dashboard for student users (or default users without specific roles)
  if (!isAdmin && !isTeacher) {
    const {
      data: { session },
    } = await supabase.auth.getSession();
    const studentData = await getStudentDashboardData();
    return (
      <StudentDashboardClient data={studentData} email={user.email} token={session?.access_token} />
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
