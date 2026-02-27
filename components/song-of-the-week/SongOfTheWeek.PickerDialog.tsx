'use client';

import { useState, useCallback, useTransition } from 'react';
import { Loader2, Search } from 'lucide-react';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import { toast } from 'sonner';
import { setSongOfTheWeek, searchSongsForSotw } from '@/app/actions/song-of-the-week';
import { cn } from '@/lib/utils';

interface SongResult {
  id: string;
  title: string;
  author: string;
  level: string | null;
}

interface SongOfTheWeekPickerDialogProps {
  isOpen: boolean;
  onClose: () => void;
}

export function SongOfTheWeekPickerDialog({ isOpen, onClose }: SongOfTheWeekPickerDialogProps) {
  const [query, setQuery] = useState('');
  const [songs, setSongs] = useState<SongResult[]>([]);
  const [selectedSongId, setSelectedSongId] = useState<string | null>(null);
  const [teacherMessage, setTeacherMessage] = useState('');
  const [isSearching, setIsSearching] = useState(false);
  const [isPending, startTransition] = useTransition();

  const handleSearch = useCallback(async (searchQuery: string) => {
    setIsSearching(true);
    const result = await searchSongsForSotw(searchQuery);
    if ('error' in result) {
      toast.error(result.error);
    } else {
      setSongs(result.songs);
    }
    setIsSearching(false);
  }, []);

  const handleQueryChange = useCallback(
    (value: string) => {
      setQuery(value);
      // Debounce-like: search on every change (server is fast enough for 20 rows)
      handleSearch(value);
    },
    [handleSearch]
  );

  const handleSubmit = () => {
    if (!selectedSongId) {
      toast.error('Please select a song');
      return;
    }

    startTransition(async () => {
      const result = await setSongOfTheWeek({
        song_id: selectedSongId,
        teacher_message: teacherMessage || undefined,
      });

      if ('error' in result) {
        toast.error(result.error);
      } else {
        toast.success('Song of the week updated!');
        resetAndClose();
      }
    });
  };

  const resetAndClose = () => {
    setQuery('');
    setSongs([]);
    setSelectedSongId(null);
    setTeacherMessage('');
    onClose();
  };

  // Load initial songs when dialog opens
  const handleOpenChange = (open: boolean) => {
    if (open) {
      handleSearch('');
    } else {
      resetAndClose();
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={handleOpenChange}>
      <DialogContent className="sm:max-w-[520px]">
        <DialogHeader>
          <DialogTitle>Select Song of the Week</DialogTitle>
          <DialogDescription>
            Choose a song to spotlight for your students this week.
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-4 py-2">
          {/* Search */}
          <div className="relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
            <Input
              placeholder="Search songs..."
              value={query}
              onChange={(e) => handleQueryChange(e.target.value)}
              className="pl-9"
            />
          </div>

          {/* Song list */}
          <div className="max-h-48 overflow-y-auto border rounded-md divide-y">
            {isSearching ? (
              <div className="flex items-center justify-center py-6">
                <Loader2 className="w-4 h-4 animate-spin text-muted-foreground" />
              </div>
            ) : songs.length === 0 ? (
              <div className="py-6 text-center text-sm text-muted-foreground">
                {query ? 'No songs found' : 'Type to search songs'}
              </div>
            ) : (
              songs.map((song) => (
                <button
                  key={song.id}
                  type="button"
                  onClick={() => setSelectedSongId(song.id)}
                  className={cn(
                    'w-full text-left px-3 py-2.5 hover:bg-accent transition-colors',
                    selectedSongId === song.id && 'bg-primary/10 border-l-2 border-l-primary'
                  )}
                >
                  <div className="font-medium text-sm truncate">{song.title}</div>
                  <div className="text-xs text-muted-foreground truncate">
                    {song.author} {song.level && `\u00B7 ${song.level}`}
                  </div>
                </button>
              ))
            )}
          </div>

          {/* Teacher message */}
          <div className="space-y-2">
            <Label htmlFor="sotw-message">Message to students (optional)</Label>
            <Textarea
              id="sotw-message"
              placeholder="Why should students learn this song?"
              value={teacherMessage}
              onChange={(e) => setTeacherMessage(e.target.value)}
              rows={2}
              maxLength={500}
            />
            <p className="text-xs text-muted-foreground text-right">
              {teacherMessage.length}/500
            </p>
          </div>
        </div>

        <DialogFooter>
          <Button variant="outline" onClick={resetAndClose} disabled={isPending}>
            Cancel
          </Button>
          <Button onClick={handleSubmit} disabled={isPending || !selectedSongId}>
            {isPending && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
            Set as Song of the Week
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
