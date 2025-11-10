import { DashboardPageContent } from '@/components/dashboard/Dashboard';
import { getUserWithRolesSSR } from '@/lib/getUserWithRolesSSR';

export default async function DashboardPage() {
  const { user, isAdmin, isTeacher, isStudent } = await getUserWithRolesSSR();

  if (!user) {
    return <div>Please log in to access the dashboard.</div>;
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
