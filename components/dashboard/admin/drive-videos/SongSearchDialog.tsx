'use client';

import { useState, useEffect } from 'react';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group';
import { Search, Loader2 } from 'lucide-react';
import { toast } from 'sonner';
import type { ReviewQueueItem } from './ReviewQueueTable';
import { useAcceptDatabaseMatch } from './useDriveVideos';

interface Song {
  id: string;
  title: string;
  author: string;
  level: string;
}

interface SongSearchDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  videoItem: ReviewQueueItem;
}

export function SongSearchDialog({ open, onOpenChange, videoItem }: SongSearchDialogProps) {
  const [query, setQuery] = useState('');
  const [searching, setSearching] = useState(false);
  const [results, setResults] = useState<Song[]>([]);
  const [selectedSongId, setSelectedSongId] = useState<string>('');
  const acceptDatabase = useAcceptDatabaseMatch();

  // Pre-fill search with parsed title
  useEffect(() => {
    if (open && videoItem.parsed?.title) {
      setQuery(videoItem.parsed.title);
      handleSearch(videoItem.parsed.title);
    }
  }, [open]);

  const handleSearch = async (searchQuery?: string) => {
    const q = searchQuery || query;
    if (!q.trim()) {
      toast.error('Please enter a search query');
      return;
    }

    setSearching(true);
    try {
      const res = await fetch(`/api/songs?q=${encodeURIComponent(q)}&limit=20`);
      if (!res.ok) throw new Error('Search failed');

      const data = await res.json();
      setResults(data.songs || []);

      if (data.songs?.length === 0) {
        toast.info('No songs found. Try a different search term.');
      }
    } catch (error) {
      toast.error('Failed to search songs');
      setResults([]);
    } finally {
      setSearching(false);
    }
  };

  const handleSubmit = () => {
    if (!selectedSongId) {
      toast.error('Please select a song');
      return;
    }

    acceptDatabase.mutate(
      {
        driveFileId: videoItem.driveFileId,
        songId: selectedSongId,
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
          <DialogTitle>Search Songs</DialogTitle>
          <DialogDescription>
            Search for a song to link to: <span className="font-medium text-foreground">{videoItem.filename}</span>
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-4 flex-1 overflow-y-auto">
          <div className="flex gap-2">
            <div className="flex-1">
              <Label htmlFor="search" className="sr-only">
                Search query
              </Label>
              <Input
                id="search"
                placeholder="Search by title or artist..."
                value={query}
                onChange={(e) => setQuery(e.target.value)}
                onKeyDown={(e) => {
                  if (e.key === 'Enter') {
                    handleSearch();
                  }
                }}
              />
            </div>
            <Button onClick={() => handleSearch()} disabled={searching}>
              {searching ? <Loader2 className="w-4 h-4 animate-spin" /> : <Search className="w-4 h-4" />}
            </Button>
          </div>

          {results.length > 0 && (
            <RadioGroup value={selectedSongId} onValueChange={setSelectedSongId} className="space-y-2">
              {results.map((song) => (
                <div key={song.id} className="flex items-center space-x-2 p-3 border border-border rounded-lg hover:bg-muted/50 cursor-pointer">
                  <RadioGroupItem value={song.id} id={song.id} />
                  <Label htmlFor={song.id} className="flex-1 cursor-pointer">
                    <div className="font-medium">{song.title}</div>
                    <div className="text-sm text-muted-foreground">
                      {song.author} · {song.level}
                    </div>
                  </Label>
                </div>
              ))}
            </RadioGroup>
          )}

          {!searching && results.length === 0 && query && (
            <div className="text-center py-8 text-muted-foreground">
              <p>No songs found. Try a different search term.</p>
            </div>
          )}
        </div>

        <DialogFooter>
          <Button variant="outline" onClick={() => onOpenChange(false)} disabled={acceptDatabase.isPending}>
            Cancel
          </Button>
          <Button onClick={handleSubmit} disabled={!selectedSongId || acceptDatabase.isPending}>
            {acceptDatabase.isPending ? <Loader2 className="w-4 h-4 mr-2 animate-spin" /> : null}
            Link to Song
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
