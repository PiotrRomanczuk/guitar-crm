'use client';

import { useEffect, useState } from 'react';
import { createClient } from '@/lib/supabase/client';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Clock, User, FileEdit } from 'lucide-react';
import { format } from 'date-fns';

interface HistoryRecord {
  id: string;
  change_type: string;
  previous_data: Record<string, unknown> | null;
  new_data: Record<string, unknown>;
  changed_at: string;
  changed_by: string;
  notes?: string;
  changer_profile?: {
    full_name: string;
    email: string;
  };
}

interface HistoryTimelineProps {
  recordId: string;
  recordType: 'assignment' | 'lesson' | 'song';
  title?: string;
}

const changeTypeColors: Record<string, string> = {
  created: 'bg-green-500/10 text-green-500 border-green-500/20',
  updated: 'bg-blue-500/10 text-blue-500 border-blue-500/20',
  status_changed: 'bg-yellow-500/10 text-yellow-500 border-yellow-500/20',
  deleted: 'bg-red-500/10 text-red-500 border-red-500/20',
  cancelled: 'bg-red-500/10 text-red-500 border-red-500/20',
  completed: 'bg-green-500/10 text-green-500 border-green-500/20',
  rescheduled: 'bg-purple-500/10 text-purple-500 border-purple-500/20',
};

const changeTypeLabels: Record<string, string> = {
  created: 'Created',
  updated: 'Updated',
  status_changed: 'Status Changed',
  deleted: 'Deleted',
  cancelled: 'Cancelled',
  completed: 'Completed',
  rescheduled: 'Rescheduled',
};

export function HistoryTimeline({ recordId, recordType, title }: HistoryTimelineProps) {
  const [history, setHistory] = useState<HistoryRecord[]>([]);
  const [loading, setLoading] = useState(true);

  const loadHistory = async () => {
    try {
      const supabase = createClient();
      const tableName = `${recordType}_history`;
      const idColumn = `${recordType}_id`;

      const { data, error } = await supabase
        .from(tableName)
        .select(
          `
          *,
          changer_profile:profiles(full_name, email)
        `
        )
        .eq(idColumn, recordId)
        .order('changed_at', { ascending: false });

      if (error) throw error;
      setHistory((data as HistoryRecord[]) || []);
    } catch (err) {
      console.error('Error loading history:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadHistory();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [recordId, recordType]);

  const renderChanges = (record: HistoryRecord) => {
    const { previous_data, new_data } = record;

    if (!previous_data) {
      return <p className="text-sm text-muted-foreground">Initial creation</p>;
    }

    const changes: string[] = [];

    // Compare objects and find differences
    Object.keys(new_data).forEach((key) => {
      if (
        key !== 'id' &&
        key !== 'created_at' &&
        key !== 'updated_at' &&
        previous_data[key] !== new_data[key]
      ) {
        const oldValue = previous_data[key] || 'none';
        const newValue = new_data[key] || 'none';

        // Format dates nicely
        if (key.includes('_at') || key === 'due_date' || key === 'scheduled_at') {
          try {
            const oldDate = new Date(oldValue as string);
            const newDate = new Date(newValue as string);
            if (!isNaN(oldDate.getTime()) && !isNaN(newDate.getTime())) {
              changes.push(
                `${key.replace(/_/g, ' ')}: ${format(oldDate, 'PPp')} → ${format(newDate, 'PPp')}`
              );
              return;
            }
          } catch {
            // fallback to string comparison
          }
        }

        changes.push(
          `${key.replace(/_/g, ' ')}: ${String(oldValue).substring(0, 50)} → ${String(
            newValue
          ).substring(0, 50)}`
        );
      }
    });

    if (changes.length === 0) {
      return <p className="text-sm text-muted-foreground">No significant changes detected</p>;
    }

    return (
      <ul className="text-sm text-muted-foreground space-y-1">
        {changes.map((change, idx) => (
          <li key={idx} className="flex items-start gap-2">
            <span className="text-primary mt-0.5">•</span>
            <span className="capitalize">{change}</span>
          </li>
        ))}
      </ul>
    );
  };

  if (loading) {
    return (
      <Card>
        <CardHeader>
          <CardTitle className="text-lg">{title || 'Change History'}</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex items-center justify-center py-8">
            <div className="h-8 w-8 animate-spin rounded-full border-4 border-primary border-t-transparent" />
          </div>
        </CardContent>
      </Card>
    );
  }

  if (history.length === 0) {
    return (
      <Card>
        <CardHeader>
          <CardTitle className="text-lg">{title || 'Change History'}</CardTitle>
        </CardHeader>
        <CardContent>
          <p className="text-sm text-muted-foreground text-center py-8">No history available</p>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle className="text-lg flex items-center gap-2">
          <FileEdit className="h-5 w-5" />
          {title || 'Change History'}
        </CardTitle>
      </CardHeader>
      <CardContent>
        <ScrollArea className="h-100 pr-4">
          <div className="space-y-4">
            {history.map((record, idx) => (
              <div key={record.id} className="relative">
                {/* Timeline line */}
                {idx !== history.length - 1 && (
                  <div className="absolute left-4 top-8 bottom-0 w-px bg-border" />
                )}

                <div className="flex gap-4">
                  {/* Timeline dot */}
                  <div className="relative flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-primary/10 border-2 border-primary">
                    <div className="h-2 w-2 rounded-full bg-primary" />
                  </div>

                  {/* Content */}
                  <div className="flex-1 space-y-2 pb-4">
                    <div className="flex items-center justify-between gap-2">
                      <Badge variant="outline" className={changeTypeColors[record.change_type]}>
                        {changeTypeLabels[record.change_type] || record.change_type}
                      </Badge>
                      <div className="flex items-center gap-2 text-xs text-muted-foreground">
                        <Clock className="h-3 w-3" />
                        {format(new Date(record.changed_at), 'PPp')}
                      </div>
                    </div>

                    {record.changer_profile && (
                      <div className="flex items-center gap-2 text-sm text-muted-foreground">
                        <User className="h-3 w-3" />
                        {record.changer_profile.full_name || record.changer_profile.email}
                      </div>
                    )}

                    <div className="rounded-lg bg-muted/50 p-3">{renderChanges(record)}</div>

                    {record.notes && (
                      <p className="text-sm text-muted-foreground italic">Note: {record.notes}</p>
                    )}
                  </div>
                </div>
              </div>
            ))}
          </div>
        </ScrollArea>
      </CardContent>
    </Card>
  );
}
