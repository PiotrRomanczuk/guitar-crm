'use client';

import { useEffect, useState, useCallback } from 'react';
import { Loader2, Filter } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { toast } from 'sonner';
import { getSongRequests, reviewSongRequest } from '@/app/actions/song-requests';
import type { SongRequestWithStudent } from '@/schemas/SongRequestSchema';
import { SongRequestQueueItem } from './SongRequestQueue.Item';

const STATUS_FILTERS = [
  { value: 'all', label: 'All' },
  { value: 'pending', label: 'Pending' },
  { value: 'approved', label: 'Approved' },
  { value: 'rejected', label: 'Rejected' },
] as const;

export function SongRequestQueue() {
  const [requests, setRequests] = useState<SongRequestWithStudent[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [statusFilter, setStatusFilter] = useState('pending');
  const [reviewingId, setReviewingId] = useState<string | null>(null);
  const [reviewNotes, setReviewNotes] = useState('');

  const fetchRequests = useCallback(async (filter: string) => {
    const { requests: data } = await getSongRequests(filter);
    return data;
  }, []);

  useEffect(() => {
    let cancelled = false;
    fetchRequests(statusFilter)
      .then((data) => {
        if (!cancelled) {
          setRequests(data);
          setIsLoading(false);
        }
      })
      .catch(() => {
        if (!cancelled) {
          setRequests([]);
          setIsLoading(false);
        }
      });
    return () => { cancelled = true; };
  }, [statusFilter, fetchRequests]);

  const handleReview = async (requestId: string, status: 'approved' | 'rejected') => {
    setReviewingId(requestId);
    try {
      const result = await reviewSongRequest(requestId, {
        status,
        reviewNotes: reviewNotes || undefined,
      });
      if (!result.success) {
        toast.error(result.error ?? 'Failed to review request');
        return;
      }
      toast.success(`Request ${status}`);
      setReviewNotes('');
      const data = await fetchRequests(statusFilter);
      setRequests(data);
    } catch (error: unknown) {
      const message = error instanceof Error ? error.message : 'An error occurred';
      toast.error(message);
    } finally {
      setReviewingId(null);
    }
  };

  const formatDate = (dateStr: string) => {
    return new Date(dateStr).toLocaleDateString('en-US', {
      month: 'short',
      day: 'numeric',
      year: 'numeric',
    });
  };

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <h3 className="text-lg font-semibold flex items-center gap-2">
          <Filter className="h-4 w-4" />
          Song Requests
        </h3>
      </div>

      <div className="flex gap-2 flex-wrap">
        {STATUS_FILTERS.map((f) => (
          <Button
            key={f.value}
            variant={statusFilter === f.value ? 'default' : 'outline'}
            size="sm"
            onClick={() => setStatusFilter(f.value)}
          >
            {f.label}
          </Button>
        ))}
      </div>

      {isLoading ? (
        <div className="flex items-center justify-center py-8">
          <Loader2 className="h-6 w-6 animate-spin text-muted-foreground" />
        </div>
      ) : requests.length === 0 ? (
        <p className="text-sm text-muted-foreground text-center py-8">
          No {statusFilter !== 'all' ? statusFilter : ''} requests found.
        </p>
      ) : (
        <div className="space-y-3">
          {requests.map((req) => (
            <SongRequestQueueItem
              key={req.id}
              request={req}
              isReviewing={reviewingId === req.id}
              reviewNotes={reviewingId === req.id ? reviewNotes : ''}
              onReviewNotesChange={setReviewNotes}
              onApprove={() => handleReview(req.id, 'approved')}
              onReject={() => handleReview(req.id, 'rejected')}
              formatDate={formatDate}
            />
          ))}
        </div>
      )}
    </div>
  );
}
