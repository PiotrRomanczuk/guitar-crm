'use client';

import { useEffect, useState, useTransition } from 'react';
import Link from 'next/link';
import {
  getGoogleEvents,
  createShadowUser,
  syncAllLessonsFromCalendar,
} from '@/app/dashboard/actions';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Calendar, ArrowRight, RefreshCw } from 'lucide-react';
import { ConnectGoogleButton } from './ConnectGoogleButton';
import { EventCard, type GoogleEvent } from './CalendarEventsList.EventCard';
import { ShadowUserDialog, SyncAllDialog } from './CalendarEventsList.Dialogs';
import { toast } from 'sonner';

interface CalendarEventsListProps {
  limit?: number;
}

export function CalendarEventsList({ limit }: CalendarEventsListProps) {
  const [events, setEvents] = useState<GoogleEvent[] | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [isConnected, setIsConnected] = useState(false);
  const [isPending, startTransition] = useTransition();
  const [shadowUserDialog, setShadowUserDialog] = useState<{ open: boolean; email: string }>({
    open: false,
    email: '',
  });
  const [syncAllDialog, setSyncAllDialog] = useState(false);

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
      } catch {
        setError('Failed to load calendar events');
      } finally {
        setLoading(false);
      }
    }

    fetchEvents();
  }, []);

  const handleCreateShadowUserClick = (email: string) => {
    setShadowUserDialog({ open: true, email });
  };

  const confirmCreateShadowUser = () => {
    const email = shadowUserDialog.email;
    setShadowUserDialog({ open: false, email: '' });

    startTransition(async () => {
      try {
        const result = await createShadowUser(email);
        if (result.success) {
          toast.success(`Successfully created shadow user for ${email}`);
        }
      } catch (err) {
        toast.error(err instanceof Error ? err.message : 'Failed to create shadow user');
      }
    });
  };

  const handleSyncAllClick = () => {
    setSyncAllDialog(true);
  };

  const confirmSyncAll = () => {
    setSyncAllDialog(false);

    startTransition(async () => {
      try {
        const result = await syncAllLessonsFromCalendar();
        if (result.success) {
          toast.success(`Successfully synced ${result.count} lessons across all users.`);
        }
      } catch (err) {
        toast.error(err instanceof Error ? err.message : 'Failed to sync all lessons');
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
      <CardHeader className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div className="flex items-center gap-2">
          <CardTitle className="flex items-center gap-2">
            <Calendar className="w-5 h-5" />
            Upcoming Events
          </CardTitle>
          <div className="text-xs text-muted-foreground hidden sm:block">
            Connected to Google Calendar
          </div>
        </div>
        <Button
          variant="outline"
          size="sm"
          onClick={handleSyncAllClick}
          disabled={isPending}
          title="Sync all lessons"
          className="w-full sm:w-auto"
        >
          <RefreshCw className={`w-4 h-4 mr-2 ${isPending ? 'animate-spin' : ''}`} />
          Sync All
        </Button>
      </CardHeader>
      <CardContent>
        {events && events.length > 0 ? (
          <div className="space-y-4">
            {(limit ? events.slice(0, limit) : events).map((event) => (
              <EventCard
                key={event.id}
                event={event}
                showAttendees={!limit}
                isPending={isPending}
                onCreateShadowUser={handleCreateShadowUserClick}
              />
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

      <ShadowUserDialog
        open={shadowUserDialog.open}
        email={shadowUserDialog.email}
        onOpenChange={(open) => !open && setShadowUserDialog({ open: false, email: '' })}
        onConfirm={confirmCreateShadowUser}
      />

      <SyncAllDialog
        open={syncAllDialog}
        onOpenChange={setSyncAllDialog}
        onConfirm={confirmSyncAll}
      />
    </Card>
  );
}
