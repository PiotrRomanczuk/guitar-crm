'use client';

import { useTransition } from 'react';
import { Button } from '@/components/ui/button';
import { Loader2, RefreshCw, X } from 'lucide-react';
import { toast } from 'sonner';
import { deactivateSongOfTheWeek } from '@/app/actions/song-of-the-week';

interface SongOfTheWeekAdminControlsProps {
  sotwId: string;
  onChangeSong: () => void;
}

export function SongOfTheWeekAdminControls({
  sotwId,
  onChangeSong,
}: SongOfTheWeekAdminControlsProps) {
  const [isPending, startTransition] = useTransition();

  const handleRemove = () => {
    startTransition(async () => {
      const result = await deactivateSongOfTheWeek(sotwId);
      if ('error' in result) {
        toast.error(result.error);
      } else {
        toast.success('Song of the week removed');
      }
    });
  };

  return (
    <div className="flex gap-2">
      <Button variant="outline" size="sm" onClick={onChangeSong}>
        <RefreshCw className="w-3.5 h-3.5 mr-1.5" />
        Change
      </Button>
      <Button
        variant="ghost"
        size="sm"
        onClick={handleRemove}
        disabled={isPending}
        className="text-muted-foreground hover:text-destructive"
      >
        {isPending ? (
          <Loader2 className="w-3.5 h-3.5 animate-spin" />
        ) : (
          <X className="w-3.5 h-3.5" />
        )}
      </Button>
    </div>
  );
}
