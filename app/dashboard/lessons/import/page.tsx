import {
  GoogleEventImporter,
  CalendarWebhookControl,
  HistoricalCalendarSync,
} from '@/components/lessons';
import { getUserWithRolesSSR } from '@/lib/getUserWithRolesSSR';
import { redirect } from 'next/navigation';

export default async function ImportLessonsPage() {
  const { user, isTeacher, isAdmin } = await getUserWithRolesSSR();

  if (!user || (!isTeacher && !isAdmin)) {
    redirect('/dashboard');
  }

  return (
    <div className="container mx-auto py-8 space-y-8">
      <h1 className="text-2xl font-bold">Import Lessons from Google Calendar</h1>
      <HistoricalCalendarSync />
      <CalendarWebhookControl />
      <GoogleEventImporter userEmail={user.email || ''} />
    </div>
  );
}
