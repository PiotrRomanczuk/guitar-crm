import { DashboardPageContent } from '@/components/dashboard/Dashboard';
import { getUserWithRolesSSR } from '@/lib/getUserWithRolesSSR';

export default async function DashboardPage() {
  const { user, isAdmin, isTeacher, isStudent } = await getUserWithRolesSSR();

  return (
    <DashboardPageContent
      email={user.email}
      isAdmin={isAdmin}
      isTeacher={isTeacher}
      isStudent={isStudent}
    />
  );
}
