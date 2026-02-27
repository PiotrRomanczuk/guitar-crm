'use client';

import { useEffect, useState, useTransition } from 'react';
import { useMemo } from 'react';
import Link from 'next/link';
import { isSameDay, format } from 'date-fns';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Calendar as CalendarIcon, ArrowRight, Clock, MapPin } from 'lucide-react';
import { CalendarView } from './CalendarView';
import { ConnectGoogleButton } from './ConnectGoogleButton';
import { getGoogleEvents } from '@/app/dashboard/calendar-actions';
import { isGuitarLesson, formatEventTime, type GoogleEvent } from '@/lib/calendar/calendar-utils';

const MAX_DAY_EVENTS = 4;

export function DashboardCalendarWidget() {
  const [events, setEvents] = useState<GoogleEvent[] | null>(null);
  const [loading, setLoading] = useState(true);
  const [isConnected, setIsConnected] = useState(false);
  const [selectedDate, setSelectedDate] = useState(new Date());
  const [, startTransition] = useTransition();

  useEffect(() => {
    startTransition(async () => {
      try {
        const data = await getGoogleEvents();
        if (data === null) {
          setIsConnected(false);
        } else {
          setIsConnected(true);
          setEvents((data as GoogleEvent[]).filter(isGuitarLesson));
        }
      } catch {
        // silently fail - widget is non-critical
      } finally {
        setLoading(false);
      }
    });
  }, []);

  if (loading) {
    return (
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2 text-lg">
            <CalendarIcon className="size-5" />
            Calendar
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex items-center justify-center py-12 text-sm text-muted-foreground">
            Loading calendar...
          </div>
        </CardContent>
      </Card>
    );
  }

  if (!isConnected) {
    return (
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2 text-lg">
            <CalendarIcon className="size-5" />
            Calendar
          </CardTitle>
        </CardHeader>
        <CardContent className="flex flex-col items-center justify-center py-8 gap-4">
          <p className="text-sm text-muted-foreground text-center">
            Connect Google Calendar to see your upcoming lessons.
          </p>
          <ConnectGoogleButton />
        </CardContent>
      </Card>
    );
  }

  return (
    <Card>
      <CardHeader className="flex flex-row items-center justify-between pb-2">
        <CardTitle className="flex items-center gap-2 text-lg">
          <CalendarIcon className="size-5" />
          Calendar
        </CardTitle>
        <Button variant="ghost" size="sm" asChild>
          <Link href="/dashboard/calendar" className="text-xs text-muted-foreground">
            View full calendar <ArrowRight className="size-3 ml-1" />
          </Link>
        </Button>
      </CardHeader>
      <CardContent>
        <div className="grid grid-cols-1 lg:grid-cols-[auto_1fr] gap-4">
          <CalendarView
            events={events ?? []}
            selectedDate={selectedDate}
            onSelectDate={setSelectedDate}
          />
          <DayEventsSummary
            events={events ?? []}
            selectedDate={selectedDate}
          />
        </div>
      </CardContent>
    </Card>
  );
}

function DayEventsSummary({
  events,
  selectedDate,
}: {
  events: GoogleEvent[];
  selectedDate: Date;
}) {
  const dayEvents = useMemo(() => {
    return events.filter((event) => {
      if (!isGuitarLesson(event)) return false;
      const dateStr = event.start.dateTime || event.start.date;
      if (!dateStr) return false;
      return isSameDay(new Date(dateStr), selectedDate);
    });
  }, [events, selectedDate]);

  return (
    <div className="flex flex-col gap-2 min-w-0">
      <h3 className="text-sm font-medium text-muted-foreground">
        {format(selectedDate, 'EEEE, MMMM d')}
        {dayEvents.length > 0 && (
          <span className="ml-1.5 text-foreground font-semibold">
            ({dayEvents.length} lesson{dayEvents.length !== 1 ? 's' : ''})
          </span>
        )}
      </h3>

      {dayEvents.length > 0 ? (
        <div className="space-y-2">
          {dayEvents.slice(0, MAX_DAY_EVENTS).map((event) => (
            <MiniEventCard key={event.id} event={event} />
          ))}
          {dayEvents.length > MAX_DAY_EVENTS && (
            <p className="text-xs text-muted-foreground pl-1">
              +{dayEvents.length - MAX_DAY_EVENTS} more
            </p>
          )}
        </div>
      ) : (
        <div className="flex items-center justify-center py-6 text-sm text-muted-foreground">
          No lessons on this day
        </div>
      )}
    </div>
  );
}

function MiniEventCard({ event }: { event: GoogleEvent }) {
  return (
    <div className="flex flex-col gap-0.5 p-2.5 border rounded-md hover:bg-accent/50 transition-colors">
      <span className="text-sm font-medium truncate">{event.summary}</span>
      <div className="flex items-center gap-3 text-xs text-muted-foreground">
        <span className="flex items-center gap-1">
          <Clock className="size-3" />
          {formatEventTime(event.start, event.end)}
        </span>
        {event.location && (
          <span className="flex items-center gap-1 truncate">
            <MapPin className="size-3 shrink-0" />
            <span className="truncate">{event.location}</span>
          </span>
        )}
      </div>
    </div>
  );
}
