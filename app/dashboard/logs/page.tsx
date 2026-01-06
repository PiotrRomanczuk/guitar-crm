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
    <div className="container mx-auto px-4 py-8">
      <SystemLogs />
    </div>
  );
}
