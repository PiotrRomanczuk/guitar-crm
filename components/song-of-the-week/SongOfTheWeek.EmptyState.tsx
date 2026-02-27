'use client';

import { Music } from 'lucide-react';
import { Button } from '@/components/ui/button';

interface SongOfTheWeekEmptyStateProps {
  isAdmin: boolean;
  onSelectSong?: () => void;
}

export function SongOfTheWeekEmptyState({
  isAdmin,
  onSelectSong,
}: SongOfTheWeekEmptyStateProps) {
  return (
    <div className="flex flex-col items-center justify-center py-6 text-center">
      <div className="w-12 h-12 rounded-full bg-muted flex items-center justify-center mb-3">
        <Music className="w-6 h-6 text-muted-foreground" />
      </div>
      <p className="text-sm text-muted-foreground mb-3">
        {isAdmin
          ? 'No song of the week selected yet.'
          : 'Check back later for this week\'s featured song!'}
      </p>
      {isAdmin && onSelectSong && (
        <Button size="sm" onClick={onSelectSong}>
          Select a Song
        </Button>
      )}
    </div>
  );
}
