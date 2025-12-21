import { getUserWithRolesSSR } from '@/lib/getUserWithRolesSSR';
import { redirect } from 'next/navigation';
import { AdminDocsClient } from '@/components/dashboard/admin/docs/AdminDocsClient';

export default async function AdminDocumentationPage() {
  const { isAdmin } = await getUserWithRolesSSR();

  if (!isAdmin) {
    redirect('/dashboard');
  }

  return <AdminDocsClient />;
}
