'use client';

import { useEffect, useState, useTransition } from 'react';
import { createShadowUser } from '@/app/dashboard/actions';
import {
  getGoogleEvents,
  syncAllLessonsFromCalendar,
} from '@/app/dashboard/calendar-actions';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Tabs, TabsList, TabsTrigger, TabsContent } from '@/components/ui/tabs';
import { Calendar as CalendarIcon, RefreshCw, List, LayoutGrid } from 'lucide-react';
import { ConnectGoogleButton } from './ConnectGoogleButton';
import { EventCard, isGuitarLesson, type GoogleEvent } from './CalendarEventsList.EventCard';
import { ShadowUserDialog, SyncAllDialog } from './CalendarEventsList.Dialogs';
import { CompactEventsList } from './CalendarEventsList.Compact';
import { CalendarView } from './CalendarView';
import { CalendarDayEvents } from './CalendarDayEvents';
import { toast } from 'sonner';

interface CalendarEventsListProps {
  limit?: number;
  initialEvents?: GoogleEvent[] | null;
  isConnected?: boolean;
}

export function CalendarEventsList({ limit, initialEvents, isConnected: initialIsConnected }: CalendarEventsListProps) {
  const [events, setEvents] = useState<GoogleEvent[] | null>(initialEvents ?? null);
  const [loading, setLoading] = useState(initialEvents === undefined);
  const [error, setError] = useState<string | null>(null);
  const [isConnected, setIsConnected] = useState(initialIsConnected ?? false);
  const [isPending, startTransition] = useTransition();
  const [selectedDate, setSelectedDate] = useState(new Date());
  const [shadowUserDialog, setShadowUserDialog] = useState<{ open: boolean; email: string }>({
    open: false,
    email: '',
  });
  const [syncAllDialog, setSyncAllDialog] = useState(false);

  useEffect(() => {
    // Only fetch if initialEvents not provided (e.g., when used in dashboard widget)
    if (initialEvents !== undefined) return;

    async function fetchEvents() {
      try {
        const data = await getGoogleEvents();
        if (data === null) {
          setIsConnected(false);
        } else {
          setIsConnected(true);
          setEvents((data as GoogleEvent[]).filter(isGuitarLesson));
        }
      } catch {
        setError('Failed to load calendar events');
      } finally {
        setLoading(false);
      }
    }

    fetchEvents();
  }, [initialEvents]);

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
            <CalendarIcon className="w-5 h-5" />
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

  if (limit) {
    return (
      <CompactEventsList
        events={events}
        limit={limit}
        isPending={isPending}
        onCreateShadowUser={handleCreateShadowUserClick}
        onSyncAll={handleSyncAllClick}
        shadowUserDialog={shadowUserDialog}
        onDismissShadowDialog={() => setShadowUserDialog({ open: false, email: '' })}
        onConfirmShadowUser={confirmCreateShadowUser}
        syncAllDialog={syncAllDialog}
        onSyncAllDialogChange={setSyncAllDialog}
        onConfirmSyncAll={confirmSyncAll}
      />
    );
  }

  return (
    <>
      <Tabs defaultValue="calendar">
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 mb-4">
          <TabsList className="w-full sm:w-auto">
            <TabsTrigger value="calendar" className="flex-1 sm:flex-initial min-h-[44px] sm:min-h-0">
              <LayoutGrid className="size-4 mr-1.5" />
              Calendar
            </TabsTrigger>
            <TabsTrigger value="list" className="flex-1 sm:flex-initial min-h-[44px] sm:min-h-0">
              <List className="size-4 mr-1.5" />
              List
            </TabsTrigger>
          </TabsList>

          <Button
            variant="outline"
            size="sm"
            className="min-h-[44px] sm:min-h-0"
            onClick={handleSyncAllClick}
            disabled={isPending}
          >
            <RefreshCw className={`w-4 h-4 mr-2 ${isPending ? 'animate-spin' : ''}`} />
            Sync All
          </Button>
        </div>

        <TabsContent value="calendar">
          {events && events.length > 0 ? (
            <div className="grid grid-cols-1 lg:grid-cols-[auto_1fr] gap-6">
              <CalendarView
                events={events}
                selectedDate={selectedDate}
                onSelectDate={setSelectedDate}
              />
              <Card>
                <CardContent className="p-4">
                  <CalendarDayEvents
                    events={events}
                    selectedDate={selectedDate}
                    isPending={isPending}
                    onCreateShadowUser={handleCreateShadowUserClick}
                  />
                </CardContent>
              </Card>
            </div>
          ) : (
            <Card>
              <CardContent className="text-center py-8 text-muted-foreground">
                No upcoming events found.
              </CardContent>
            </Card>
          )}
        </TabsContent>

        <TabsContent value="list">
          <Card>
            <CardContent className="p-4">
              {events && events.length > 0 ? (
                <div className="space-y-4">
                  {events.map((event) => (
                    <EventCard
                      key={event.id}
                      event={event}
                      showAttendees
                      isPending={isPending}
                      onCreateShadowUser={handleCreateShadowUserClick}
                    />
                  ))}
                </div>
              ) : (
                <div className="text-center py-8 text-muted-foreground">
                  No upcoming events found.
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>

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
    </>
  );
}
