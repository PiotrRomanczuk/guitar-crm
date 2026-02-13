'use client';

import { useMemo } from 'react';
import { Calendar, CalendarDayButton } from '@/components/ui/calendar';
import { cn } from '@/lib/utils';
import { isGuitarLesson, type GoogleEvent } from '@/lib/calendar/calendar-utils';
import type { DayButton } from 'react-day-picker';

interface CalendarViewProps {
  events: GoogleEvent[];
  selectedDate: Date;
  onSelectDate: (date: Date) => void;
}

export function CalendarView({ events, selectedDate, onSelectDate }: CalendarViewProps) {
  const eventsByDate = useMemo(() => {
    const map = new Map<string, number>();
    for (const event of events) {
      if (!isGuitarLesson(event)) continue;
      const dateStr = event.start.dateTime || event.start.date;
      if (!dateStr) continue;
      const key = new Date(dateStr).toDateString();
      map.set(key, (map.get(key) || 0) + 1);
    }
    return map;
  }, [events]);

  return (
    <Calendar
      mode="single"
      selected={selectedDate}
      onSelect={(date) => date && onSelectDate(date)}
      className="rounded-md border w-full"
      classNames={{
        month: 'flex flex-col w-full gap-4',
        weekdays: 'flex w-full',
        weekday: 'text-muted-foreground rounded-md flex-1 font-normal text-[0.8rem] select-none',
        week: 'flex w-full mt-2',
        day: 'relative w-full h-full p-0 text-center group/day aspect-square select-none [&:first-child[data-selected=true]_button]:rounded-l-md [&:last-child[data-selected=true]_button]:rounded-r-md',
      }}
      components={{
        DayButton: (props) => (
          <EventDayButton {...props} eventsByDate={eventsByDate} />
        ),
      }}
    />
  );
}

function EventDayButton({
  eventsByDate,
  ...props
}: React.ComponentProps<typeof DayButton> & {
  eventsByDate: Map<string, number>;
}) {
  const dateKey = props.day.date.toDateString();
  const count = eventsByDate.get(dateKey) || 0;

  return (
    <CalendarDayButton {...props}>
      <span>{props.day.date.getDate()}</span>
      {count > 0 && (
        <span className="flex gap-0.5 justify-center">
          {Array.from({ length: Math.min(count, 3) }).map((_, i) => (
            <span
              key={i}
              className={cn(
                'size-1 rounded-full',
                props.modifiers.selected
                  ? 'bg-primary-foreground'
                  : 'bg-primary'
              )}
            />
          ))}
        </span>
      )}
    </CalendarDayButton>
  );
}
