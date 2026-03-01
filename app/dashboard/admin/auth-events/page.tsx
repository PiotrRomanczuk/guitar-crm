import { redirect } from 'next/navigation';
import { getUserWithRolesSSR } from '@/lib/getUserWithRolesSSR';
import { AuthEventsClient } from '@/components/dashboard/admin/auth-events/AuthEventsClient';

export default async function AuthEventsPage() {
  const { user, isAdmin } = await getUserWithRolesSSR();

  if (!user) redirect('/sign-in');
  if (!isAdmin) redirect('/dashboard');

  return (
    <div className="container mx-auto px-4 py-8 space-y-6">
      <h1 className="text-2xl font-bold">Auth Events</h1>
      <AuthEventsClient />
    </div>
  );
}
