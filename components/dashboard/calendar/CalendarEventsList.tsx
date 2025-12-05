'use client';

import { useEffect, useState, useTransition } from 'react';
import Link from 'next/link';
import { getGoogleEvents, createShadowUser, syncAllLessonsFromCalendar } from '@/app/dashboard/actions';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Calendar, Clock, MapPin, ArrowRight, UserPlus, RefreshCw } from 'lucide-react';
import { ConnectGoogleButton } from './ConnectGoogleButton';

interface GoogleEvent {
  id: string;
  summary: string;
  description?: string;
  location?: string;
  start: { dateTime?: string; date?: string };
  end: { dateTime?: string; date?: string };
  htmlLink: string;
  attendees?: { email: string; responseStatus?: string }[];
}

interface CalendarEventsListProps {
  limit?: number;
}

export function CalendarEventsList({ limit }: CalendarEventsListProps) {
  const [events, setEvents] = useState<GoogleEvent[] | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [isConnected, setIsConnected] = useState(false);
  const [isPending, startTransition] = useTransition();

  useEffect(() => {
    async function fetchEvents() {
      try {
        const data = await getGoogleEvents();
        if (data === null) {
          setIsConnected(false);
        } else {
          setIsConnected(true);
          setEvents(data as GoogleEvent[]);
        }
      } catch (err) {
        console.error(err);
        setError('Failed to load calendar events');
      } finally {
        setLoading(false);
      }
    }

    fetchEvents();
  }, []);

  const handleCreateShadowUser = (email: string) => {
    if (!confirm(`Create shadow user for ${email}?`)) return;

    startTransition(async () => {
      try {
        const result = await createShadowUser(email);
        if (result.success) {
          alert(`Successfully created shadow user for ${email}`);
        }
      } catch (error) {
        console.error(error);
        alert(error instanceof Error ? error.message : 'Failed to create shadow user');
      }
    });
  };

  const handleSyncAll = () => {
    if (!confirm('Sync all lessons from calendar? This will create shadow users for any new students found.')) return;

    startTransition(async () => {
      try {
        const result = await syncAllLessonsFromCalendar();
        if (result.success) {
          alert(`Successfully synced ${result.count} lessons across all users.`);
        }
      } catch (error) {
        console.error(error);
        alert(error instanceof Error ? error.message : 'Failed to sync all lessons');
      }
    });
  };

  if (loading) {
    return <div className="p-4 text-center">Loading calendar events...</div>;
  }

  if (!isConnected) {
    return (
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Calendar className="w-5 h-5" />
            Google Calendar
          </CardTitle>
        </CardHeader>
        <CardContent className="flex flex-col items-center justify-center py-8 gap-4">
          <p className="text-muted-foreground text-center">
            Connect your Google Calendar to see your upcoming lessons and events.
          </p>
          <ConnectGoogleButton />
        </CardContent>
      </Card>
    );
  }

  if (error) {
    return (
      <Card className="border-destructive/50 bg-destructive/10">
        <CardContent className="p-4 text-destructive">{error}</CardContent>
      </Card>
    );
  }

  return (
    <Card>
      <CardHeader className="flex flex-row items-center justify-between">
        <div className="flex items-center gap-2">
          <CardTitle className="flex items-center gap-2">
            <Calendar className="w-5 h-5" />
            Upcoming Events
          </CardTitle>
          <div className="text-xs text-muted-foreground hidden sm:block">Connected to Google Calendar</div>
        </div>
        <Button 
          variant="outline" 
          size="sm" 
          onClick={handleSyncAll} 
          disabled={isPending}
          title="Sync all lessons"
        >
          <RefreshCw className={`w-4 h-4 mr-2 ${isPending ? 'animate-spin' : ''}`} />
          Sync All
        </Button>
      </CardHeader>
      <CardContent>
        {events && events.length > 0 ? (
          <div className="space-y-4">
            {(limit ? events.slice(0, limit) : events).map((event) => (
              <div
                key={event.id}
                className="flex flex-col gap-1 p-3 border rounded-lg hover:bg-accent/50 transition-colors"
              >
                <div className="font-medium">{event.summary}</div>
                <div className="flex items-center gap-4 text-sm text-muted-foreground">
                  <div className="flex items-center gap-1">
                    <Clock className="w-3 h-3" />
                    {formatEventTime(event.start, event.end)}
                  </div>
                  {event.location && (
                    <div className="flex items-center gap-1">
                      <MapPin className="w-3 h-3" />
                      <span className="truncate max-w-[200px]">{event.location}</span>
                    </div>
                  )}
                </div>

                {/* Attendees Section - Only show if not limited (full view) or if explicitly needed */}
                {!limit && event.attendees && event.attendees.length > 0 && (
                  <div className="mt-2 pt-2 border-t flex flex-wrap gap-2">
                    {event.attendees.map((attendee) => (
                      <div
                        key={attendee.email}
                        className="flex items-center gap-2 text-xs bg-secondary/50 p-1.5 rounded-md"
                      >
                        <span className="text-muted-foreground">{attendee.email}</span>
                        <Button
                          variant="ghost"
                          size="icon"
                          className="h-5 w-5 hover:bg-primary/10 hover:text-primary"
                          title="Create Shadow User & Sync"
                          onClick={(e) => {
                            e.preventDefault();
                            handleCreateShadowUser(attendee.email);
                          }}
                          disabled={isPending}
                        >
                          <UserPlus className="h-3 w-3" />
                        </Button>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            ))}

            {limit && events.length > limit && (
              <div className="pt-2">
                <Button variant="outline" className="w-full" asChild>
                  <Link href="/dashboard/calendar">
                    View all events <ArrowRight className="w-4 h-4 ml-2" />
                  </Link>
                </Button>
              </div>
            )}
          </div>
        ) : (
          <div className="text-center py-8 text-muted-foreground">No upcoming events found.</div>
        )}
      </CardContent>
    </Card>
  );
}

function formatEventTime(
  start: { dateTime?: string; date?: string },
  end: { dateTime?: string; date?: string }
) {
  if (start.date) {
    return new Date(start.date).toLocaleDateString(undefined, {
      month: 'short',
      day: 'numeric',
    });
  }

  if (start.dateTime && end.dateTime) {
    const startDate = new Date(start.dateTime);
    const endDate = new Date(end.dateTime);

    return `${startDate.toLocaleDateString(undefined, {
      month: 'short',
      day: 'numeric',
    })} • ${startDate.toLocaleTimeString(undefined, {
      hour: 'numeric',
      minute: '2-digit',
    })} - ${endDate.toLocaleTimeString(undefined, {
      hour: 'numeric',
      minute: '2-digit',
    })}`;
  }

  return '';
}
