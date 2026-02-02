'use client';

import { useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { AlertTriangle, CheckCircle, XCircle } from 'lucide-react';

interface ConflictData {
  remote_title?: string;
  remote_scheduled_at?: string;
  remote_notes?: string;
  remote_updated?: string;
}

interface Conflict {
  id: string;
  lesson_id: string;
  conflict_data: ConflictData;
  created_at: string;
  lesson?: {
    title: string;
    scheduled_at: string;
    notes?: string;
    updated_at: string;
  };
}

interface ConflictResolutionPanelProps {
  conflicts: Conflict[];
  onResolve: (conflictId: string, resolution: 'use_local' | 'use_remote') => Promise<void>;
}

export function ConflictResolutionPanel({ conflicts, onResolve }: ConflictResolutionPanelProps) {
  const [resolving, setResolving] = useState<string | null>(null);

  if (conflicts.length === 0) {
    return (
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <CheckCircle className="h-5 w-5 text-green-600" />
            No Sync Conflicts
          </CardTitle>
          <CardDescription>
            All lessons are in sync with Google Calendar
          </CardDescription>
        </CardHeader>
      </Card>
    );
  }

  const handleResolve = async (conflictId: string, resolution: 'use_local' | 'use_remote') => {
    setResolving(conflictId);
    try {
      await onResolve(conflictId, resolution);
    } finally {
      setResolving(null);
    }
  };

  const formatDate = (dateStr: string) => {
    try {
      return new Date(dateStr).toLocaleString();
    } catch {
      return dateStr;
    }
  };

  return (
    <div className="space-y-4">
      <Card className="border-amber-200 dark:border-amber-800">
        <CardHeader>
          <CardTitle className="flex items-center gap-2 text-amber-700 dark:text-amber-400">
            <AlertTriangle className="h-5 w-5" />
            Sync Conflicts ({conflicts.length})
          </CardTitle>
          <CardDescription>
            These lessons have conflicting changes in Strummy and Google Calendar
          </CardDescription>
        </CardHeader>
      </Card>

      {conflicts.map((conflict) => (
        <Card key={conflict.id} className="border-amber-100 dark:border-amber-900">
          <CardHeader>
            <CardTitle className="text-base">
              Conflict Detected
              <Badge variant="outline" className="ml-2">
                {formatDate(conflict.created_at)}
              </Badge>
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            {/* Title Conflict */}
            {conflict.lesson?.title !== conflict.conflict_data.remote_title && (
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-1">
                  <div className="text-sm font-medium">Strummy Title</div>
                  <div className="rounded-md border p-2 bg-blue-50 dark:bg-blue-950">
                    {conflict.lesson?.title}
                  </div>
                </div>
                <div className="space-y-1">
                  <div className="text-sm font-medium">Google Calendar Title</div>
                  <div className="rounded-md border p-2 bg-green-50 dark:bg-green-950">
                    {conflict.conflict_data.remote_title}
                  </div>
                </div>
              </div>
            )}

            {/* Scheduled Time Conflict */}
            {conflict.lesson?.scheduled_at !== conflict.conflict_data.remote_scheduled_at && (
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-1">
                  <div className="text-sm font-medium">Strummy Time</div>
                  <div className="rounded-md border p-2 bg-blue-50 dark:bg-blue-950">
                    {formatDate(conflict.lesson?.scheduled_at || '')}
                  </div>
                </div>
                <div className="space-y-1">
                  <div className="text-sm font-medium">Google Calendar Time</div>
                  <div className="rounded-md border p-2 bg-green-50 dark:bg-green-950">
                    {formatDate(conflict.conflict_data.remote_scheduled_at || '')}
                  </div>
                </div>
              </div>
            )}

            {/* Notes Conflict */}
            {conflict.lesson?.notes !== conflict.conflict_data.remote_notes && (
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-1">
                  <div className="text-sm font-medium">Strummy Notes</div>
                  <div className="rounded-md border p-2 bg-blue-50 dark:bg-blue-950 text-sm">
                    {conflict.lesson?.notes || <em className="text-muted-foreground">No notes</em>}
                  </div>
                </div>
                <div className="space-y-1">
                  <div className="text-sm font-medium">Google Calendar Notes</div>
                  <div className="rounded-md border p-2 bg-green-50 dark:bg-green-950 text-sm">
                    {conflict.conflict_data.remote_notes || (
                      <em className="text-muted-foreground">No notes</em>
                    )}
                  </div>
                </div>
              </div>
            )}

            {/* Resolution Actions */}
            <div className="flex gap-2 pt-4 border-t">
              <Button
                variant="outline"
                className="flex-1"
                onClick={() => handleResolve(conflict.id, 'use_local')}
                disabled={resolving === conflict.id}
              >
                <XCircle className="h-4 w-4 mr-2" />
                Keep Strummy Version
              </Button>
              <Button
                variant="outline"
                className="flex-1"
                onClick={() => handleResolve(conflict.id, 'use_remote')}
                disabled={resolving === conflict.id}
              >
                <CheckCircle className="h-4 w-4 mr-2" />
                Use Google Calendar Version
              </Button>
            </div>

            {resolving === conflict.id && (
              <div className="text-sm text-center text-muted-foreground">
                Resolving conflict...
              </div>
            )}
          </CardContent>
        </Card>
      ))}
    </div>
  );
}
