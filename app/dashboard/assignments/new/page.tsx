import { createClient } from '@/lib/supabase/server';
import AssignmentForm from '@/components/assignments/AssignmentForm';
import { redirect } from 'next/navigation';

export default async function NewAssignmentPage() {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    redirect('/login');
  }

  // Fetch students
  const { data: students, error } = await supabase
    .from('profiles')
    .select('id, full_name, email')
    .eq('is_student', true);

  if (error) {
    console.error('Error fetching students:', error);
  } else {
    console.log('Fetched students count:', students?.length);
    console.log('Fetched students:', JSON.stringify(students, null, 2));
  }

  return (
    <div className="container mx-auto px-4 py-8">
      <AssignmentForm mode="create" students={students || []} />
    </div>
  );
}
