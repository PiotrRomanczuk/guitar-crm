import { NotificationAnalytics } from '@/components/admin/NotificationAnalytics';
import { getUserWithRolesSSR } from '@/lib/getUserWithRolesSSR';
import { redirect } from 'next/navigation';

export default async function NotificationAnalyticsPage() {
  const { user, isAdmin } = await getUserWithRolesSSR();

  if (!user) {
    redirect('/sign-in');
  }

  if (!isAdmin) {
    redirect('/dashboard');
  }

  return (
    <div className="container mx-auto px-4 py-8">
      <NotificationAnalytics />
    </div>
  );
}
