'use client';

import { useState } from 'react';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import { Card, CardContent } from '@/components/ui/card';
import {
  type AuthEvent,
  EVENT_TYPE_LABELS,
  getEventBadgeColor,
  getEmailStatusBadgeColor,
  formatEventTime,
} from './auth-events.helpers';

interface AuthEventsTableProps {
  events: AuthEvent[];
  isLoading: boolean;
}

export function AuthEventsTable({ events, isLoading }: AuthEventsTableProps) {
  const [expandedId, setExpandedId] = useState<string | null>(null);

  if (isLoading) {
    return (
      <Card>
        <CardContent className="py-12 text-center text-muted-foreground">
          Loading auth events...
        </CardContent>
      </Card>
    );
  }

  if (events.length === 0) {
    return (
      <Card>
        <CardContent className="py-12 text-center text-muted-foreground">
          No auth events found.
        </CardContent>
      </Card>
    );
  }

  return (
    <Card>
      <CardContent className="p-0">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead className="w-[140px]">Time</TableHead>
              <TableHead className="w-[160px]">Event</TableHead>
              <TableHead>Email</TableHead>
              <TableHead className="w-[100px]">Email Delivery</TableHead>
              <TableHead className="w-[80px]">Details</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {events.map((event) => (
              <EventRow
                key={event.id}
                event={event}
                isExpanded={expandedId === event.id}
                onToggle={() => setExpandedId(expandedId === event.id ? null : event.id)}
              />
            ))}
          </TableBody>
        </Table>
      </CardContent>
    </Card>
  );
}

function EventRow({
  event,
  isExpanded,
  onToggle,
}: {
  event: AuthEvent;
  isExpanded: boolean;
  onToggle: () => void;
}) {
  return (
    <>
      <TableRow className="cursor-pointer hover:bg-muted/50" onClick={onToggle}>
        <TableCell className="text-xs text-muted-foreground whitespace-nowrap">
          {formatEventTime(event.occurred_at)}
        </TableCell>
        <TableCell>
          <span className={`inline-block px-2 py-0.5 rounded text-xs font-medium ${getEventBadgeColor(event.event_type)}`}>
            {EVENT_TYPE_LABELS[event.event_type] ?? event.event_type}
          </span>
        </TableCell>
        <TableCell className="text-sm font-mono truncate max-w-[200px]">
          {event.user_email ?? '—'}
        </TableCell>
        <TableCell>
          {event.email_status !== 'not_applicable' && (
            <span className={`inline-block px-2 py-0.5 rounded text-xs font-medium ${getEmailStatusBadgeColor(event.email_status)}`}>
              {event.email_status}
            </span>
          )}
        </TableCell>
        <TableCell>
          <button className="text-xs text-blue-600 dark:text-blue-400 hover:underline">
            {isExpanded ? 'Hide' : 'Show'}
          </button>
        </TableCell>
      </TableRow>
      {isExpanded && (
        <TableRow>
          <TableCell colSpan={5} className="bg-muted/30 px-6 py-3">
            <ExpandedDetails event={event} />
          </TableCell>
        </TableRow>
      )}
    </>
  );
}

function ExpandedDetails({ event }: { event: AuthEvent }) {
  return (
    <div className="grid grid-cols-2 gap-x-8 gap-y-1 text-xs">
      {event.error_message && (
        <div className="col-span-2">
          <span className="font-medium text-red-600 dark:text-red-400">Error: </span>
          <span className="text-muted-foreground">{event.error_message}</span>
        </div>
      )}
      {event.email_error && (
        <div className="col-span-2">
          <span className="font-medium text-red-600 dark:text-red-400">Email Error: </span>
          <span className="text-muted-foreground">{event.email_error}</span>
        </div>
      )}
      <div>
        <span className="font-medium">User ID: </span>
        <span className="text-muted-foreground font-mono">{event.user_id ?? '—'}</span>
      </div>
      <div>
        <span className="font-medium">Actor ID: </span>
        <span className="text-muted-foreground font-mono">{event.actor_id ?? '—'}</span>
      </div>
      <div>
        <span className="font-medium">IP: </span>
        <span className="text-muted-foreground font-mono">{event.ip_address ?? '—'}</span>
      </div>
      <div>
        <span className="font-medium">Event ID: </span>
        <span className="text-muted-foreground font-mono">{event.id}</span>
      </div>
      {event.metadata && Object.keys(event.metadata).length > 0 && (
        <div className="col-span-2 mt-1">
          <span className="font-medium">Metadata: </span>
          <pre className="mt-1 text-muted-foreground bg-muted p-2 rounded text-[10px] overflow-x-auto">
            {JSON.stringify(event.metadata, null, 2)}
          </pre>
        </div>
      )}
    </div>
  );
}
