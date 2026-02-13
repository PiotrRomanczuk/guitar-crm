import { Suspense } from 'react';
import { CalendarEventsList } from '@/components/dashboard/calendar/CalendarEventsList';
import { CalendarSkeleton } from '@/components/ui/skeleton-screens';
import { getGoogleEvents } from '@/app/dashboard/calendar-actions';
import { isGuitarLesson, type GoogleEvent } from '@/components/dashboard/calendar/CalendarEventsList.EventCard';

export default async function CalendarPage() {
  // Fetch calendar events server-side
  const eventsData = await getGoogleEvents();
  const initialEvents = eventsData === null ? null : (eventsData as GoogleEvent[]).filter(isGuitarLesson);
  const isConnected = eventsData !== null;

  return (
    <div className="container mx-auto px-3 sm:px-4 md:px-6 lg:px-8 py-4 sm:py-6 lg:py-8 max-w-6xl">
      <h1 className="text-2xl sm:text-3xl font-bold mb-6">Calendar</h1>
      <Suspense fallback={<CalendarSkeleton />}>
        <CalendarEventsList initialEvents={initialEvents} isConnected={isConnected} />
      </Suspense>
    </div>
  );
}
