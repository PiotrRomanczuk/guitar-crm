'use client';

import { Card } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { CheckCircle2, XCircle } from 'lucide-react';
import type { SpotifyMatch } from './types';

interface SpotifyMatchCardProps {
  match: SpotifyMatch;
  status: 'approved' | 'rejected';
}

export function SpotifyMatchCard({ match, status }: SpotifyMatchCardProps) {
  const isApproved = status === 'approved';

  return (
    <Card className="bg-card rounded-lg border border-border shadow-sm">
      <div className="p-4 sm:p-5 flex flex-col sm:flex-row sm:items-start justify-between gap-3">
        <div className="flex-1 min-w-0 space-y-1">
          <h3 className="font-semibold text-base truncate">{match.songs.title}</h3>
          <p className="text-sm text-muted-foreground truncate">
            {isApproved ? 'Matched to' : 'Rejected match'}: {match.spotify_track_name} by{' '}
            {match.spotify_artist_name}
          </p>
          <p className="text-xs text-muted-foreground">
            Confidence: {match.confidence_score}%
          </p>
        </div>
        <Badge
          variant="outline"
          className={
            isApproved
              ? 'bg-green-500/10 text-green-600 dark:text-green-400 border-green-500/20 shrink-0'
              : 'bg-destructive/10 text-destructive border-destructive/20 shrink-0'
          }
        >
          {isApproved ? (
            <>
              <CheckCircle2 className="w-3 h-3 mr-1" />
              Approved
            </>
          ) : (
            <>
              <XCircle className="w-3 h-3 mr-1" />
              Rejected
            </>
          )}
        </Badge>
      </div>
    </Card>
  );
}
