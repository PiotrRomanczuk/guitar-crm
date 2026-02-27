'use client';

import { useTransition } from 'react';
import { Button } from '@/components/ui/button';
import { Loader2, Plus, Check } from 'lucide-react';
import { toast } from 'sonner';
import { addSotwToRepertoire } from '@/app/actions/song-of-the-week';

interface SongOfTheWeekAddButtonProps {
  alreadyInRepertoire: boolean;
}

export function SongOfTheWeekAddButton({ alreadyInRepertoire }: SongOfTheWeekAddButtonProps) {
  const [isPending, startTransition] = useTransition();

  if (alreadyInRepertoire) {
    return (
      <Button variant="outline" disabled className="w-full">
        <Check className="w-4 h-4 mr-2" />
        Already in My Songs
      </Button>
    );
  }

  const handleAdd = () => {
    startTransition(async () => {
      const result = await addSotwToRepertoire();
      if ('error' in result) {
        toast.error(result.error);
      } else {
        toast.success('Song added to your repertoire!');
      }
    });
  };

  return (
    <Button onClick={handleAdd} disabled={isPending} className="w-full">
      {isPending ? (
        <Loader2 className="w-4 h-4 mr-2 animate-spin" />
      ) : (
        <Plus className="w-4 h-4 mr-2" />
      )}
      Add to My Songs
    </Button>
  );
}
