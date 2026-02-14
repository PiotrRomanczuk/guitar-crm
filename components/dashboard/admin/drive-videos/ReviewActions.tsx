'use client';

import { useState } from 'react';
import { Button } from '@/components/ui/button';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
  DropdownMenuSeparator,
} from '@/components/ui/dropdown-menu';
import { MoreVertical, CheckCircle, Search, Music, XCircle } from 'lucide-react';
import { toast } from 'sonner';
import type { ReviewQueueItem } from './ReviewQueueTable';
import { SongSearchDialog } from './SongSearchDialog';
import { SpotifyCreateSongDialog } from './SpotifyCreateSongDialog';
import { useAcceptDatabaseMatch } from './useDriveVideos';

interface ReviewActionsProps {
  item: ReviewQueueItem;
}

export function ReviewActions({ item }: ReviewActionsProps) {
  const [showSongSearch, setShowSongSearch] = useState(false);
  const [showSpotifyCreate, setShowSpotifyCreate] = useState(false);
  const acceptDatabase = useAcceptDatabaseMatch();

  const handleAcceptSuggestion = () => {
    if (!item.bestMatch) {
      toast.error('No match suggestion available');
      return;
    }

    acceptDatabase.mutate({
      driveFileId: item.driveFileId,
      songId: item.bestMatch.songId,
    });
  };

  const handleSkip = async () => {
    try {
      const res = await fetch('/api/admin/drive-sync', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          action: 'skip',
          driveFileIds: [item.driveFileId],
        }),
      });

      if (!res.ok) {
        const errorData = await res.json().catch(() => ({ error: 'Unknown error' }));
        throw new Error(errorData.error || 'Failed to skip video');
      }

      toast.success('Video skipped');
      // Note: Skip doesn't actually modify data, just logs it
    } catch (error) {
      const message = error instanceof Error ? error.message : 'Failed to skip video';
      toast.error(message);
    }
  };

  return (
    <>
      <DropdownMenu>
        <DropdownMenuTrigger asChild>
          <Button variant="ghost" size="sm" disabled={acceptDatabase.isPending} className="h-8 w-8 p-0">
            <MoreVertical className="h-4 w-4" />
            <span className="sr-only">Open actions menu</span>
          </Button>
        </DropdownMenuTrigger>
        <DropdownMenuContent align="end" className="w-[220px]">
          {item.bestMatch && (
            <>
              <DropdownMenuItem onClick={handleAcceptSuggestion} disabled={acceptDatabase.isPending}>
                <CheckCircle className="mr-2 h-4 w-4 text-blue-600" />
                Accept Database Match
              </DropdownMenuItem>
              <DropdownMenuSeparator />
            </>
          )}
          <DropdownMenuItem onClick={() => setShowSongSearch(true)} disabled={acceptDatabase.isPending}>
            <Search className="mr-2 h-4 w-4" />
            Search Songs Manually
          </DropdownMenuItem>
          <DropdownMenuItem onClick={() => setShowSpotifyCreate(true)} disabled={acceptDatabase.isPending}>
            <Music className="mr-2 h-4 w-4 text-green-600" />
            Search Spotify Manually
          </DropdownMenuItem>
          <DropdownMenuSeparator />
          <DropdownMenuItem onClick={handleSkip} disabled={acceptDatabase.isPending} className="text-red-600">
            <XCircle className="mr-2 h-4 w-4" />
            Skip This Video
          </DropdownMenuItem>
        </DropdownMenuContent>
      </DropdownMenu>

      {showSongSearch && (
        <SongSearchDialog
          open={showSongSearch}
          onOpenChange={setShowSongSearch}
          videoItem={item}
        />
      )}

      {showSpotifyCreate && (
        <SpotifyCreateSongDialog
          open={showSpotifyCreate}
          onOpenChange={setShowSpotifyCreate}
          videoItem={item}
        />
      )}
    </>
  );
}
