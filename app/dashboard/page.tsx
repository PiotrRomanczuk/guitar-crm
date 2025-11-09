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
    // TODO: Fetch actual stats from API endpoint
    const stats = {
      totalUsers: 0,
      totalTeachers: 0,
      totalStudents: 0,
      totalSongs: 0,
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
