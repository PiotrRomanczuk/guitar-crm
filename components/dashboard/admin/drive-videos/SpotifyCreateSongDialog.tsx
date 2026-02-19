'use client';

import { useState, useEffect } from 'react';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Search, Loader2, Music, CheckCircle } from 'lucide-react';
import { toast } from 'sonner';
import Image from 'next/image';
import type { SpotifyTrack } from '@/types/spotify';
import type { ReviewQueueItem } from './ReviewQueueTable';
import { useAcceptSpotifySuggestion } from './useDriveVideos';

interface SpotifyCreateSongDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  videoItem: ReviewQueueItem;
}

export function SpotifyCreateSongDialog({
  open,
  onOpenChange,
  videoItem,
}: SpotifyCreateSongDialogProps) {
  const [query, setQuery] = useState('');
  const [results, setResults] = useState<SpotifyTrack[]>([]);
  const [searching, setSearching] = useState(false);
  const [searched, setSearched] = useState(false);

  // Pre-fill search with parsed title + artist
  useEffect(() => {
    if (open && videoItem.parsed) {
      const searchQuery = videoItem.parsed.artist
        ? `${videoItem.parsed.title} ${videoItem.parsed.artist}`
        : videoItem.parsed.title;
      setQuery(searchQuery);
      handleSearch(searchQuery);
    }
  }, [open]);

  const handleSearch = async (searchQuery?: string) => {
    const q = searchQuery || query;
    if (!q.trim()) {
      toast.error('Please enter a search query');
      return;
    }

    setSearching(true);
    setSearched(true);
    try {
      const res = await fetch(`/api/spotify/search?q=${encodeURIComponent(q)}`);
      if (!res.ok) {
        const errorData = await res.json().catch(() => ({ error: 'Search failed' }));
        throw new Error(errorData.error || 'Search failed');
      }

      const data = await res.json();
      setResults(data.results || []);

      if (!data.results || data.results.length === 0) {
        toast.info('No tracks found on Spotify. Try a different search term.');
      }
    } catch (error) {
      const message = error instanceof Error ? error.message : 'Failed to search Spotify';
      toast.error(message);
      setResults([]);
    } finally {
      setSearching(false);
    }
  };

  const acceptSpotify = useAcceptSpotifySuggestion();

  const handleSelectTrack = (track: SpotifyTrack) => {
    acceptSpotify.mutate(
      {
        spotifyTrackId: track.id,
        driveFileId: videoItem.driveFileId,
        filename: videoItem.filename,
        parsed: videoItem.parsed,
      },
      {
        onSuccess: () => {
          onOpenChange(false);
        },
      }
    );
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-2xl max-h-[80vh] overflow-hidden flex flex-col">
        <DialogHeader>
          <DialogTitle>Create Song from Spotify</DialogTitle>
          <DialogDescription>
            Search Spotify to create a new song and link: <span className="font-medium text-foreground">{videoItem.filename}</span>
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-4 flex-1 overflow-y-auto">
          <div className="flex gap-2">
            <div className="relative flex-1">
              <Search className="absolute left-3 top-2.5 h-4 w-4 text-muted-foreground" />
              <Input
                placeholder="Search Spotify for a song..."
                value={query}
                onChange={(e) => setQuery(e.target.value)}
                onKeyDown={(e) => {
                  if (e.key === 'Enter') {
                    e.preventDefault();
                    handleSearch();
                  }
                }}
                className="pl-9"
              />
            </div>
            <Button onClick={() => handleSearch()} disabled={searching}>
              {searching ? <Loader2 className="h-4 w-4 animate-spin" /> : 'Search'}
            </Button>
          </div>

          {searched && results.length === 0 && !searching && (
            <div className="text-center py-8 text-muted-foreground">
              <Music className="h-12 w-12 mx-auto mb-3 opacity-50" />
              <p>No tracks found on Spotify.</p>
              <p className="text-sm">Try a different search term.</p>
            </div>
          )}

          {results.length > 0 && (
            <div className="space-y-2">
              <p className="text-sm text-muted-foreground">Select a track to create a new song:</p>
              {results.map((track) => (
                <Card
                  key={track.id}
                  className="cursor-pointer hover:bg-accent transition-colors"
                  onClick={() => !acceptSpotify.isPending && handleSelectTrack(track)}
                >
                  <CardContent className="p-3 flex items-center gap-3">
                    {track.image ? (
                      <div className="relative w-12 h-12 rounded overflow-hidden flex-shrink-0">
                        <Image
                          src={track.image}
                          alt={track.album}
                          fill
                          className="object-cover"
                          sizes="48px"
                        />
                      </div>
                    ) : (
                      <div className="w-12 h-12 rounded bg-muted flex items-center justify-center flex-shrink-0">
                        <Music className="h-6 w-6 text-muted-foreground" />
                      </div>
                    )}
                    <div className="flex-1 min-w-0">
                      <p className="font-medium text-sm truncate">{track.name}</p>
                      <p className="text-xs text-muted-foreground truncate">{track.artist}</p>
                      <p className="text-xs text-muted-foreground truncate">{track.album} · {track.release_date}</p>
                    </div>
                    {acceptSpotify.isPending ? (
                      <Loader2 className="h-5 w-5 animate-spin text-muted-foreground" />
                    ) : (
                      <CheckCircle className="h-5 w-5 text-green-600 opacity-0 group-hover:opacity-100" />
                    )}
                  </CardContent>
                </Card>
              ))}
            </div>
          )}
        </div>
      </DialogContent>
    </Dialog>
  );
}
