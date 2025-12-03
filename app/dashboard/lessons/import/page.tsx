import { GoogleEventImporter } from '@/components/lessons/GoogleEventImporter';
import { getUserWithRolesSSR } from '@/lib/getUserWithRolesSSR';
import { redirect } from 'next/navigation';

export default async function ImportLessonsPage() {
  const { user, isTeacher } = await getUserWithRolesSSR();
  
  if (!user || !isTeacher) {
    redirect('/dashboard');
  }
  
  return (
    <div className="container mx-auto py-8">
      <h1 className="text-2xl font-bold mb-4">Import Lessons from Google Calendar</h1>
      <GoogleEventImporter />
    </div>
  );
}
