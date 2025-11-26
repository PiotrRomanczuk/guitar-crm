import { redirect } from 'next/navigation';
import { createClient } from '@/lib/supabase/server';
import { getUserWithRolesSSR } from '@/lib/getUserWithRolesSSR';
import AssignmentForm from '@/components/assignments/AssignmentForm';

interface Assignment {
  id: string;
  title: string;
  description: string | null;
  due_date: string | null;
  priority: 'LOW' | 'MEDIUM' | 'HIGH' | 'URGENT';
  status: 'OPEN' | 'IN_PROGRESS' | 'PENDING_REVIEW' | 'COMPLETED' | 'CANCELLED' | 'BLOCKED';
  user_id: string;
}

async function getAssignment(id: string): Promise<Assignment | null> {
  const supabase = await createClient();
  const { user, isAdmin } = await getUserWithRolesSSR();

  if (!user) redirect('/auth/login');

  let query = supabase.from('assignments').select('*').eq('id', id);

  if (!isAdmin) {
    query = query.eq('user_id', user.id);
  }

  const { data, error } = await query.single();

  if (error || !data) return null;
  return data as Assignment;
}

export default async function EditAssignmentPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const { isAdmin } = await getUserWithRolesSSR();

  if (!isAdmin) {
    redirect('/dashboard');
  }

  const assignment = await getAssignment(id);

  if (!assignment) {
    redirect('/dashboard/assignments');
  }

  return <AssignmentForm mode="edit" initialData={assignment} />;
}
