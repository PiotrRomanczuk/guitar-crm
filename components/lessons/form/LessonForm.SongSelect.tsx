'use client';

import { useState } from 'react';
import { useSongs } from '../hooks/useSongs';
import { Label } from '@/components/ui/label';
import { Input } from '@/components/ui/input';
import { Checkbox } from '@/components/ui/checkbox';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Badge } from '@/components/ui/badge';
import { Loader2, Music, X, Search } from 'lucide-react';
import { Button } from '@/components/ui/button';

interface SongSelectProps {
  selectedSongIds: string[];
  onChange: (songIds: string[]) => void;
  error?: string;
}

export function SongSelect({ selectedSongIds, onChange, error }: SongSelectProps) {
  const { songs, loading, error: songsError } = useSongs();
  const [searchQuery, setSearchQuery] = useState('');

  const handleToggle = (songId: string) => {
    const newSelection = selectedSongIds.includes(songId)
      ? selectedSongIds.filter((id) => id !== songId)
      : [...selectedSongIds, songId];
    onChange(newSelection);
  };

  const handleRemove = (songId: string) => {
    onChange(selectedSongIds.filter((id) => id !== songId));
  };

  const selectedSongs = songs.filter((song) => selectedSongIds.includes(song.id));

  // Filter songs based on search query
  const filteredSongs = songs.filter((song) => {
    if (!searchQuery) return true;
    const query = searchQuery.toLowerCase();
    return (
      song.title.toLowerCase().includes(query) ||
      (song.author && song.author.toLowerCase().includes(query))
    );
  });

  if (loading) {
    return (
      <div className="space-y-2">
        <Label>Songs</Label>
        <div className="flex items-center gap-2 text-sm text-muted-foreground p-4 border border-border rounded-lg">
          <Loader2 className="h-4 w-4 animate-spin" />
          <span>Loading songs...</span>
        </div>
      </div>
    );
  }

  if (songsError) {
    return (
      <div className="space-y-2">
        <Label>Songs</Label>
        <div className="text-sm text-destructive p-4 border border-destructive/20 bg-destructive/10 rounded-lg">
          Error loading songs: {songsError}
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-3">
      <div className="flex items-center justify-between">
        <Label>Songs (Optional)</Label>
        {selectedSongIds.length > 0 && (
          <span className="text-xs text-muted-foreground">{selectedSongIds.length} selected</span>
        )}
      </div>

      {/* Selected Songs Display */}
      {selectedSongs.length > 0 && (
        <div className="flex flex-wrap gap-2 p-3 bg-muted/50 rounded-lg border border-border">
          {selectedSongs.map((song) => (
            <Badge key={song.id} variant="secondary" className="gap-1.5 pr-1 text-xs sm:text-sm">
              <Music className="h-3 w-3" />
              <span className="max-w-[150px] truncate">{song.title}</span>
              <Button
                type="button"
                variant="ghost"
                size="sm"
                className="h-4 w-4 p-0 hover:bg-transparent"
                onClick={() => handleRemove(song.id)}
              >
                <X className="h-3 w-3" />
              </Button>
            </Badge>
          ))}
        </div>
      )}

      {/* Search Input */}
      <div className="relative">
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
        <Input
          type="text"
          placeholder="Search songs by title or author..."
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          className="pl-9"
        />
      </div>

      {/* Song Selection List */}
      <div className="border border-border rounded-lg">
        <ScrollArea className="h-[240px] sm:h-[280px]">
          <div className="p-2 space-y-1">
            {filteredSongs.length === 0 ? (
              <div className="text-center py-8 text-sm text-muted-foreground">
                {searchQuery
                  ? 'No songs match your search.'
                  : 'No songs available. Create songs first.'}
              </div>
            ) : (
              filteredSongs.map((song) => (
                <label
                  key={song.id}
                  className="flex items-center gap-3 p-2.5 sm:p-3 rounded-md hover:bg-muted/50 cursor-pointer transition-colors group"
                >
                  <Checkbox
                    checked={selectedSongIds.includes(song.id)}
                    onCheckedChange={() => handleToggle(song.id)}
                    className="shrink-0"
                  />
                  <div className="flex-1 min-w-0">
                    <div className="font-medium text-sm truncate group-hover:text-primary transition-colors">
                      {song.title}
                    </div>
                    {song.author && (
                      <div className="text-xs text-muted-foreground truncate">{song.author}</div>
                    )}
                  </div>
                </label>
              ))
            )}
          </div>
        </ScrollArea>
      </div>

      {error && <p className="text-sm text-destructive">{error}</p>}
      <p className="text-xs text-muted-foreground">
        Select songs that will be covered in this lesson
      </p>
    </div>
  );
}
