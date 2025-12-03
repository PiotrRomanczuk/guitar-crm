import { CalendarEventsList } from '@/components/dashboard/calendar/CalendarEventsList';

export default function CalendarPage() {
  return (
    <div className="container mx-auto px-4 py-8 max-w-6xl">
      <h1 className="text-2xl font-bold mb-6">Calendar Events</h1>
      <CalendarEventsList />
    </div>
  );
}
