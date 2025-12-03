import { redirect } from 'next/navigation';
import { getUserWithRolesSSR } from '@/lib/getUserWithRolesSSR';
import AssignmentForm from '@/components/assignments/AssignmentForm';

export default async function CreateAssignmentPage() {
  const { user, isAdmin } = await getUserWithRolesSSR();

  if (!user || !isAdmin) {
    redirect('/dashboard');
  }

  return <AssignmentForm mode="create" userId={user.id} />;
}
