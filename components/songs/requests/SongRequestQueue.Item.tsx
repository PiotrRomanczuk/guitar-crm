import { Check, X, Loader2, ExternalLink } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import type { SongRequestWithStudent } from '@/schemas/SongRequestSchema';
import { SongRequestStatusBadge } from './SongRequestStatusBadge';

export interface QueueItemProps {
  request: SongRequestWithStudent;
  isReviewing: boolean;
  reviewNotes: string;
  onReviewNotesChange: (v: string) => void;
  onApprove: () => void;
  onReject: () => void;
  formatDate: (d: string) => string;
}

export function SongRequestQueueItem({
  request,
  isReviewing,
  reviewNotes,
  onReviewNotesChange,
  onApprove,
  onReject,
  formatDate,
}: QueueItemProps) {
  const isPending = request.status === 'pending';

  return (
    <div className="rounded-lg border p-4 space-y-3">
      <div className="flex items-start justify-between gap-2">
        <div className="min-w-0 flex-1">
          <div className="flex items-center gap-2 flex-wrap">
            <span className="font-medium">{request.title}</span>
            {request.artist && (
              <span className="text-sm text-muted-foreground">
                by {request.artist}
              </span>
            )}
            <SongRequestStatusBadge status={request.status} />
          </div>
          <p className="text-xs text-muted-foreground mt-1">
            {request.student?.full_name ?? 'Unknown Student'} -- {formatDate(request.created_at)}
          </p>
        </div>
        {request.url && (
          <a
            href={request.url}
            target="_blank"
            rel="noopener noreferrer"
            className="text-muted-foreground hover:text-foreground shrink-0"
          >
            <ExternalLink className="h-4 w-4" />
          </a>
        )}
      </div>

      {request.notes && (
        <p className="text-sm text-muted-foreground">{request.notes}</p>
      )}

      {request.review_notes && !isPending && (
        <p className="text-sm italic text-muted-foreground">
          Review: &quot;{request.review_notes}&quot;
        </p>
      )}

      {isPending && (
        <div className="space-y-2 pt-1">
          <Textarea
            placeholder="Add review notes (optional)..."
            value={reviewNotes}
            onChange={(e) => onReviewNotesChange(e.target.value)}
            rows={2}
            className="text-sm"
          />
          <div className="flex gap-2">
            <Button
              size="sm"
              onClick={onApprove}
              disabled={isReviewing}
              className="gap-1"
            >
              {isReviewing ? (
                <Loader2 className="h-3 w-3 animate-spin" />
              ) : (
                <Check className="h-3 w-3" />
              )}
              Approve
            </Button>
            <Button
              size="sm"
              variant="outline"
              onClick={onReject}
              disabled={isReviewing}
              className="gap-1"
            >
              {isReviewing ? (
                <Loader2 className="h-3 w-3 animate-spin" />
              ) : (
                <X className="h-3 w-3" />
              )}
              Reject
            </Button>
          </div>
        </div>
      )}
    </div>
  );
}
