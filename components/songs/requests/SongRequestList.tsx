'use client';

import { useEffect, useState, useRef } from 'react';
import { Loader2 } from 'lucide-react';
import { getSongRequests } from '@/app/actions/song-requests';
import type { SongRequestWithStudent } from '@/schemas/SongRequestSchema';
import { SongRequestStatusBadge } from './SongRequestStatusBadge';

interface SongRequestListProps {
  refreshKey: number;
}

/**
 * Displays a student's past song requests with their statuses.
 */
export function SongRequestList({ refreshKey }: SongRequestListProps) {
  const [requests, setRequests] = useState<SongRequestWithStudent[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const isMounted = useRef(true);

  useEffect(() => {
    isMounted.current = true;
    let cancelled = false;

    getSongRequests()
      .then(({ requests: data }) => {
        if (!cancelled) setRequests(data);
      })
      .catch(() => {
        if (!cancelled) setRequests([]);
      })
      .finally(() => {
        if (!cancelled) setIsLoading(false);
      });

    return () => {
      cancelled = true;
    };
  }, [refreshKey]);

  if (isLoading) {
    return (
      <div className="flex items-center justify-center py-6">
        <Loader2 className="h-5 w-5 animate-spin text-muted-foreground" />
      </div>
    );
  }

  if (requests.length === 0) return null;

  return (
    <div className="space-y-2">
      <h3 className="text-sm font-medium text-muted-foreground">
        Your Requests ({requests.length})
      </h3>
      <div className="space-y-2">
        {requests.map((req) => (
          <div
            key={req.id}
            className="flex items-center justify-between rounded-lg border p-3 text-sm"
          >
            <div className="min-w-0 flex-1">
              <p className="font-medium truncate">{req.title}</p>
              {req.artist && (
                <p className="text-xs text-muted-foreground truncate">
                  {req.artist}
                </p>
              )}
              {req.review_notes && (
                <p className="text-xs text-muted-foreground mt-1 italic">
                  &quot;{req.review_notes}&quot;
                </p>
              )}
            </div>
            <SongRequestStatusBadge status={req.status} />
          </div>
        ))}
      </div>
    </div>
  );
}
