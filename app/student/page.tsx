import { getStudentDashboardData } from '@/app/actions/student/dashboard';
import { StudentDashboardClient } from '@/components/dashboard/student/StudentDashboardClient';
import { getUserWithRolesSSR } from '@/lib/getUserWithRolesSSR';
import { redirect } from 'next/navigation';

export default async function StudentPage() {
  const { user } = await getUserWithRolesSSR();

  if (!user) {
    redirect('/sign-in');
  }

  const data = await getStudentDashboardData();

  return <StudentDashboardClient data={data} email={user.email} />;
}
