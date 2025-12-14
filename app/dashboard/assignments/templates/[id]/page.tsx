import { createClient } from '@/lib/supabase/server';
import { redirect, notFound } from 'next/navigation';
import TemplateForm from '@/components/assignments/templates/TemplateForm';

interface EditTemplatePageProps {
  params: Promise<{
    id: string;
  }>;
}

export default async function EditTemplatePage({ params }: EditTemplatePageProps) {
  const { id } = await params;
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    redirect('/login');
  }

  // Check if user is teacher or admin
  const { data: profile } = await supabase
    .from('profiles')
    .select('is_admin, is_teacher')
    .eq('id', user.id)
    .single();

  if (!profile?.is_admin && !profile?.is_teacher) {
    redirect('/dashboard');
  }

  // Fetch template
  const { data: template, error } = await supabase
    .from('assignment_templates')
    .select('*')
    .eq('id', id)
    .single();

  if (error || !template) {
    notFound();
  }

  // Check ownership if not admin
  if (!profile.is_admin && template.teacher_id !== user.id) {
    redirect('/dashboard/assignments/templates');
  }

  return (
    <div className="container mx-auto px-4 py-8">
      <h1 className="text-2xl font-bold mb-6">Edit Assignment Template</h1>
      <TemplateForm mode="edit" initialData={template} userId={user.id} />
    </div>
  );
}
