import { createClient } from '@/lib/supabase/server';
import { DashboardPageContent } from '@/components/dashboard/Dashboard';
import { AdminDashboardClient } from '@/components/dashboard/admin/AdminDashboardClient';
import { StudentDashboardClient } from '@/components/dashboard/student/StudentDashboardClient';
import { getUserWithRolesSSR } from '@/lib/getUserWithRolesSSR';
import { getStudentDashboardData } from '@/app/actions/student/dashboard';

export default async function DashboardPage() {
  const { user, isAdmin, isTeacher, isStudent } = await getUserWithRolesSSR();

  if (!user) {
    return <div>Please log in to access the dashboard.</div>;
  }

  // Show admin dashboard for admin users
  if (isAdmin) {
    // Fetch actual stats from Supabase
    const supabase = await createClient();

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

    const stats = {
      totalUsers: totalUsers || 0,
      totalTeachers: totalTeachers || 0,
      totalStudents: totalStudents || 0,
      totalSongs: totalSongs || 0,
      totalLessons: totalLessons || 0,
      recentUsers: recentUsers || [],
    };

    return <AdminDashboardClient stats={stats} />;
  }

  // Show student dashboard for student users (or default users without specific roles)
  if (!isAdmin && !isTeacher) {
    const studentData = await getStudentDashboardData();
    return <StudentDashboardClient data={studentData} email={user.email} />;
  }

  return (
    <DashboardPageContent
      email={user.email}
      isAdmin={isAdmin}
      isTeacher={isTeacher}
      isStudent={isStudent}
    />
  );
}
