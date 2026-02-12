'use client';

import Link from 'next/link';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Calendar as CalendarIcon, ArrowRight, RefreshCw } from 'lucide-react';
import { EventCard, type GoogleEvent } from './CalendarEventsList.EventCard';
import { ShadowUserDialog, SyncAllDialog } from './CalendarEventsList.Dialogs';

interface CompactEventsListProps {
  events: GoogleEvent[] | null;
  limit: number;
  isPending: boolean;
  onCreateShadowUser: (email: string) => void;
  onSyncAll: () => void;
  shadowUserDialog: { open: boolean; email: string };
  onDismissShadowDialog: () => void;
  onConfirmShadowUser: () => void;
  syncAllDialog: boolean;
  onSyncAllDialogChange: (open: boolean) => void;
  onConfirmSyncAll: () => void;
}

export function CompactEventsList({
  events,
  limit,
  isPending,
  onCreateShadowUser,
  onSyncAll,
  shadowUserDialog,
  onDismissShadowDialog,
  onConfirmShadowUser,
  syncAllDialog,
  onSyncAllDialogChange,
  onConfirmSyncAll,
}: CompactEventsListProps) {
  return (
    <Card>
      <CardHeader className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div className="flex items-center gap-2">
          <CardTitle className="flex items-center gap-2">
            <CalendarIcon className="w-5 h-5" />
            Upcoming Events
          </CardTitle>
          <div className="text-xs text-muted-foreground hidden sm:block">
            Connected to Google Calendar
          </div>
        </div>
        <Button
          variant="outline"
          size="sm"
          onClick={onSyncAll}
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
            {events.slice(0, limit).map((event) => (
              <EventCard
                key={event.id}
                event={event}
                showAttendees={false}
                isPending={isPending}
                onCreateShadowUser={onCreateShadowUser}
              />
            ))}

            {events.length > limit && (
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
        onOpenChange={(open) => !open && onDismissShadowDialog()}
        onConfirm={onConfirmShadowUser}
      />

      <SyncAllDialog
        open={syncAllDialog}
        onOpenChange={onSyncAllDialogChange}
        onConfirm={onConfirmSyncAll}
      />
    </Card>
  );
}
