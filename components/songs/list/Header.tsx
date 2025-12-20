import Link from 'next/link';
import { Button } from '@/components/ui/button';
import { Plus } from 'lucide-react';

interface Props {
  canManageSongs: boolean;
}

export default function SongListHeader({ canManageSongs }: Props) {
  return (
    <div className="flex items-center justify-between opacity-0 animate-fade-in">
      <div className="space-y-1">
        <h2 className="text-3xl font-bold tracking-tight">Song Library</h2>
        <p className="text-muted-foreground">Manage your collection of songs and exercises</p>
      </div>
      {canManageSongs && (
        <Link href="/dashboard/songs/new">
          <Button className="gap-2" data-testid="song-new-button">
            <Plus className="w-4 h-4" />
            Add Song
          </Button>
        </Link>
      )}
    </div>
  );
}
