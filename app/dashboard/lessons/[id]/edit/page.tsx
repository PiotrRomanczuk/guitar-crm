import { redirect } from 'next/navigation';
import { createClient } from '@/lib/supabase/server';
import { getUserWithRolesSSR } from '@/lib/getUserWithRolesSSR';
import { getLessonByIdHandler } from '@/app/api/lessons/handlers';
import LessonForm from '@/components/lessons/LessonForm';

export default async function EditLessonPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const supabase = await createClient();
  const { user, isAdmin, isTeacher, isStudent } = await getUserWithRolesSSR();

  if (!user) {
    redirect('/login');
  }

  // Construct profile object for handler
  const profile = {
    isAdmin,
    isTeacher,
    isStudent,
  };

  // Check if user has permission to edit (Teacher or Admin)
  if (!isAdmin && !isTeacher) {
    redirect('/dashboard');
  }

  const { lesson, error, status } = await getLessonByIdHandler(supabase, user, profile, id);

  if (error || !lesson) {
    if (status === 404) {
      return (
        <div className="p-6">
          <h1 className="text-2xl font-bold text-red-600">Lesson Not Found</h1>
          <p className="mt-2">The lesson you are trying to edit does not exist.</p>
        </div>
      );
    }
    if (status === 403) {
      redirect('/dashboard');
    }
    return (
      <div className="p-6">
        <h1 className="text-2xl font-bold text-red-600">Error</h1>
        <p className="mt-2">{error}</p>
      </div>
    );
  }

  return (
    <div className="container mx-auto py-6 max-w-3xl">
      <div className="mb-6">
        <h1 className="text-2xl font-bold">Edit Lesson</h1>
        <p className="text-muted-foreground">Update lesson details and assignments.</p>
      </div>

      <LessonForm initialData={lesson} />
    </div>
  );
}
