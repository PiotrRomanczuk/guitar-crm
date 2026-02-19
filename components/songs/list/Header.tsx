import Link from 'next/link';
import { Button } from '@/components/ui/button';
import { Plus } from 'lucide-react';
import { SyncSpotifyButton } from './SyncSpotifyButton';
import { ExportButton } from '@/components/shared/export-button';

interface Props {
  canManageSongs: boolean;
}

export default function SongListHeader({ canManageSongs }: Props) {
  return (
    <div className="flex flex-col gap-4 opacity-0 animate-fade-in">
      <div className="space-y-1">
        <h2 className="text-2xl sm:text-3xl font-bold tracking-tight">Song Library</h2>
        <p className="text-sm sm:text-base text-muted-foreground">
          Manage your collection of songs and exercises
        </p>
      </div>
      {canManageSongs && (
        <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-2">
          <ExportButton endpoint="/api/song/export" />
          <SyncSpotifyButton />
          <Link href="/dashboard/songs/new" className="w-full sm:w-auto">
            <Button className="gap-2 w-full sm:w-auto" data-testid="song-new-button">
              <Plus className="w-4 h-4" />
              Add Song
            </Button>
          </Link>
        </div>
      )}
    </div>
  );
}
