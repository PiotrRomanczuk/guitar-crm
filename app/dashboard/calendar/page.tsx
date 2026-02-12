import { CalendarEventsList } from '@/components/dashboard/calendar/CalendarEventsList';

export default function CalendarPage() {
  return (
    <div className="container mx-auto px-3 sm:px-4 md:px-6 lg:px-8 py-4 sm:py-6 lg:py-8 max-w-6xl">
      <h1 className="text-2xl sm:text-3xl font-bold mb-6">Calendar</h1>
      <CalendarEventsList />
    </div>
  );
}
