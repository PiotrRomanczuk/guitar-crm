import { redirect } from 'next/navigation';
import { getUserWithRolesSSR } from '@/lib/getUserWithRolesSSR';

export default async function DashboardLayout({ children }: { children: React.ReactNode }) {
  const { user } = await getUserWithRolesSSR();
  if (!user) {
    redirect('/sign-in?redirect=/dashboard');
  }
  return <>{children}</>;
}
