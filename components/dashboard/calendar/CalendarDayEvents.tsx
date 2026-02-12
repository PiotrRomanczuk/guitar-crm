'use client';

import { useMemo } from 'react';
import { isSameDay, format } from 'date-fns';
import { CalendarDays } from 'lucide-react';
import { EventCard, type GoogleEvent } from './CalendarEventsList.EventCard';

interface CalendarDayEventsProps {
  events: GoogleEvent[];
  selectedDate: Date;
  isPending: boolean;
  onCreateShadowUser: (email: string) => void;
}

export function CalendarDayEvents({
  events,
  selectedDate,
  isPending,
  onCreateShadowUser,
}: CalendarDayEventsProps) {
  const dayEvents = useMemo(() => {
    return events.filter((event) => {
      const dateStr = event.start.dateTime || event.start.date;
      if (!dateStr) return false;
      return isSameDay(new Date(dateStr), selectedDate);
    });
  }, [events, selectedDate]);

  return (
    <div className="flex flex-col gap-3">
      <h3 className="text-sm font-medium text-muted-foreground">
        {format(selectedDate, 'EEEE, MMMM d')}
        {dayEvents.length > 0 && (
          <span className="ml-2 text-foreground">
            ({dayEvents.length} lesson{dayEvents.length !== 1 ? 's' : ''})
          </span>
        )}
      </h3>

      {dayEvents.length > 0 ? (
        <div className="space-y-3">
          {dayEvents.map((event) => (
            <EventCard
              key={event.id}
              event={event}
              showAttendees
              isPending={isPending}
              onCreateShadowUser={onCreateShadowUser}
            />
          ))}
        </div>
      ) : (
        <div className="flex flex-col items-center justify-center py-8 text-muted-foreground gap-2">
          <CalendarDays className="size-8 opacity-40" />
          <p className="text-sm">No lessons on this day</p>
        </div>
      )}
    </div>
  );
}
