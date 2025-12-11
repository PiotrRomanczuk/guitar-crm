import { createClient } from '@/lib/supabase/server';
import AssignmentForm from '@/components/assignments/AssignmentForm';
import { redirect } from 'next/navigation';

interface NewAssignmentPageProps {
  searchParams: Promise<{
    templateId?: string;
  }>;
}

export default async function NewAssignmentPage({ searchParams }: NewAssignmentPageProps) {
  const { templateId } = await searchParams;
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
  }

  let initialData = undefined;

  if (templateId) {
    const { data: template } = await supabase
      .from('assignment_templates')
      .select('*')
      .eq('id', templateId)
      .single();
    
    if (template) {
      initialData = {
        title: template.title,
        description: template.description,
        status: 'not_started' as const,
        teacher_id: user.id,
        student_id: '', // User must select student
        due_date: null,
        id: '', // New assignment
      };
    }
  }

  return (
    <div className="container mx-auto px-4 py-8">
      <AssignmentForm mode="create" students={students || []} initialData={initialData} userId={user.id} />
    </div>
  );
}
