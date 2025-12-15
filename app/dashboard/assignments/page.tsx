import { redirect } from 'next/navigation';
import { createClient } from '@/lib/supabase/server';
import AssignmentList from '@/components/assignments/AssignmentList';
import { StudentAssignmentsPageClient } from '@/components/student/assignments/StudentAssignmentsPageClient';

/**
 * Assignments dashboard page
 * Shows list of assignments based on user role
 */
export default async function AssignmentsPage() {
  const supabase = await createClient();

  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    redirect('/login');
  }

  // Get user profile for role checking
  const { data: profile } = await supabase
    .from('profiles')
    .select('is_admin, is_teacher, is_student')
    .eq('id', user.id)
    .single();

  const canCreate = profile?.is_admin || profile?.is_teacher;

  if (profile?.is_student && !canCreate) {
    return <StudentAssignmentsPageClient />;
  }

  return (
    <div className="container mx-auto px-3 sm:px-4 md:px-6 py-4 sm:py-6 md:py-8">
      <AssignmentList canCreate={canCreate} />
    </div>
  );
}
