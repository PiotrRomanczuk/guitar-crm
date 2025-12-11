import { createClient } from '@/lib/supabase/server';
import { redirect } from 'next/navigation';
import TemplateForm from '@/components/assignments/templates/TemplateForm';

export default async function NewTemplatePage() {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();

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

  return (
    <div className="container mx-auto px-4 py-8">
      <h1 className="text-2xl font-bold mb-6">Create Assignment Template</h1>
      <TemplateForm mode="create" userId={user.id} />
    </div>
  );
}
