'use client';

import { useState, useMemo } from 'react';
import { useQuery } from '@tanstack/react-query';
import { Card, CardContent } from '@/components/ui/card';
import { getAuthEvents } from '@/app/dashboard/actions';
import { AuthEventsFilters } from './AuthEventsFilters';
import { AuthEventsTable } from './AuthEventsTable';
import type { AuthEvent } from './auth-events.helpers';
import { EVENT_TYPE_GROUPS } from './auth-events.helpers';

export function AuthEventsClient() {
  const [email, setEmail] = useState('');
  const [eventTypeGroup, setEventTypeGroup] = useState('all');
  const [eventType, setEventType] = useState('all');
  const [statusFilter, setStatusFilter] = useState('all');

  const successFilter = statusFilter === 'success' ? true : statusFilter === 'failure' ? false : undefined;

  const { data: rawEvents = [], isLoading } = useQuery<AuthEvent[]>({
    queryKey: ['auth-events', { email, eventType, successFilter }],
    queryFn: () => getAuthEvents({
      email: email || undefined,
      eventType: eventType !== 'all' ? eventType : undefined,
      success: successFilter,
      limit: 200,
    }),
    refetchInterval: 30_000,
    staleTime: 10_000,
  });

  const events = useMemo(() => {
    let filtered = rawEvents;

    // Client-side group filter (when specific event type not selected)
    if (eventTypeGroup !== 'all' && eventType === 'all') {
      const groupTypes = EVENT_TYPE_GROUPS[eventTypeGroup] ?? [];
      filtered = filtered.filter((e) => groupTypes.includes(e.event_type));
    }

    return filtered;
  }, [rawEvents, eventTypeGroup, eventType]);

  const stats = useMemo(() => {
    const all = events;
    const failed = all.filter((e) => !e.success).length;
    const emailFails = all.filter((e) => e.email_status === 'failed').length;
    const uniqueEmails = new Set(all.map((e) => e.user_email).filter(Boolean)).size;
    return { total: all.length, failed, emailFails, uniqueEmails };
  }, [events]);

  return (
    <div className="space-y-4">
      <AuthEventsFilters
        email={email}
        onEmailChange={setEmail}
        eventTypeGroup={eventTypeGroup}
        onEventTypeGroupChange={setEventTypeGroup}
        eventType={eventType}
        onEventTypeChange={setEventType}
        statusFilter={statusFilter}
        onStatusChange={setStatusFilter}
      />

      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
        <StatCard label="Total Events" value={stats.total} />
        <StatCard label="Failed" value={stats.failed} variant={stats.failed > 0 ? 'danger' : 'default'} />
        <StatCard label="Email Failures" value={stats.emailFails} variant={stats.emailFails > 0 ? 'danger' : 'default'} />
        <StatCard label="Unique Emails" value={stats.uniqueEmails} />
      </div>

      <AuthEventsTable events={events} isLoading={isLoading} />
    </div>
  );
}

function StatCard({ label, value, variant = 'default' }: {
  label: string;
  value: number;
  variant?: 'default' | 'danger';
}) {
  return (
    <Card>
      <CardContent className="pt-4 pb-4">
        <p className="text-xs text-muted-foreground">{label}</p>
        <p className={`text-2xl font-bold ${variant === 'danger' ? 'text-red-600 dark:text-red-400' : ''}`}>
          {value}
        </p>
      </CardContent>
    </Card>
  );
}
