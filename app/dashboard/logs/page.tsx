import { getUserWithRolesSSR } from '@/lib/getUserWithRolesSSR';
import { redirect } from 'next/navigation';
import { SystemLogs } from '@/components/logs/SystemLogs';

export default async function LogsPage() {
  const { user, isAdmin, isTeacher } = await getUserWithRolesSSR();

  if (!user) {
    redirect('/sign-in');
  }

  // Only admins and teachers can view system logs
  if (!isAdmin && !isTeacher) {
    redirect('/dashboard');
  }

  return (
    <div className="container mx-auto px-3 sm:px-4 md:px-6 lg:px-8 py-4 sm:py-6 lg:py-8 max-w-7xl">
      <SystemLogs />
    </div>
  );
}
