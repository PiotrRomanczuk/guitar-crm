import { createClient } from '@/lib/supabase/server';
import { DashboardPageContent } from '@/components/dashboard/Dashboard';
import { AdminDashboardClient } from '@/components/dashboard/admin/AdminDashboardClient';
import { getUserWithRolesSSR } from '@/lib/getUserWithRolesSSR';

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
      supabase.from('profiles').select('*', { count: 'exact', head: true }).eq('is_teacher', true),
      supabase.from('profiles').select('*', { count: 'exact', head: true }).eq('is_student', true),
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

  return (
    <DashboardPageContent
      email={user.email}
      isAdmin={isAdmin}
      isTeacher={isTeacher}
      isStudent={isStudent}
    />
  );
}
