'use client';

import { useState, useEffect } from 'react';
import { createClient } from '@/lib/supabase/client';
import {
  Drawer,
  DrawerClose,
  DrawerContent,
  DrawerDescription,
  DrawerFooter,
  DrawerHeader,
  DrawerTitle,
} from '@/components/ui/drawer';
import { Button } from '@/components/ui/button';
import { Checkbox } from '@/components/ui/checkbox';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { Search, Music, CheckCircle2 } from 'lucide-react';
import { toast } from 'sonner';
import Image from 'next/image';

interface Song {
  id: string;
  title: string;
  author: string | null;
  cover_image_url: string | null;
  spotify_link_url: string | null;
}

interface SongSelectionDrawerProps {
  open: boolean;
  onClose: () => void;
  onConfirm: (selectedIds: string[]) => void;
}

export function SongSelectionDrawer({ open, onClose, onConfirm }: SongSelectionDrawerProps) {
  const [songs, setSongs] = useState<Song[]>([]);
  const [filteredSongs, setFilteredSongs] = useState<Song[]>([]);
  const [selectedIds, setSelectedIds] = useState<Set<string>>(new Set());
  const [searchQuery, setSearchQuery] = useState('');
  const [loading, setLoading] = useState(false);
  const [showOnlyMissing, setShowOnlyMissing] = useState(true);

  useEffect(() => {
    if (open) {
      loadSongs();
    } else {
      // Reset state when closed
      setSelectedIds(new Set());
      setSearchQuery('');
    }
  }, [open]);

  useEffect(() => {
    filterSongs();
  }, [songs, searchQuery, showOnlyMissing]);

  const loadSongs = async () => {
    setLoading(true);
    try {
      const supabase = createClient();
      let query = supabase
        .from('songs')
        .select('id, title, author, cover_image_url, spotify_link_url')
        .is('deleted_at', null)
        .order('title');

      if (showOnlyMissing) {
        query = query.is('spotify_link_url', null);
      }

      const { data, error } = await query;

      if (error) throw error;
      setSongs(data || []);
    } catch (error) {
      console.error('Failed to load songs:', error);
      toast.error('Failed to load songs');
    } finally {
      setLoading(false);
    }
  };

  const filterSongs = () => {
    let filtered = songs;

    if (searchQuery.trim()) {
      const query = searchQuery.toLowerCase();
      filtered = filtered.filter(
        (song) =>
          song.title.toLowerCase().includes(query) || song.author?.toLowerCase().includes(query)
      );
    }

    setFilteredSongs(filtered);
  };

  const toggleSong = (songId: string) => {
    setSelectedIds((prev) => {
      const newSet = new Set(prev);
      if (newSet.has(songId)) {
        newSet.delete(songId);
      } else {
        newSet.add(songId);
      }
      return newSet;
    });
  };

  const toggleAll = () => {
    if (selectedIds.size === filteredSongs.length) {
      setSelectedIds(new Set());
    } else {
      setSelectedIds(new Set(filteredSongs.map((s) => s.id)));
    }
  };

  const handleConfirm = () => {
    if (selectedIds.size === 0) {
      toast.error('Please select at least one song');
      return;
    }
    onConfirm(Array.from(selectedIds));
    onClose();
  };

  return (
    <Drawer open={open} onOpenChange={(isOpen) => !isOpen && onClose()}>
      <DrawerContent className="max-h-[85vh]">
        <DrawerHeader>
          <DrawerTitle>Select Songs to Sync</DrawerTitle>
          <DrawerDescription>Choose which songs you want to sync with Spotify</DrawerDescription>
        </DrawerHeader>

        <div className="px-4 space-y-4">
          {/* Search and Filter */}
          <div className="flex gap-2">
            <div className="relative flex-1">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
              <Input
                placeholder="Search songs or artists..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="pl-9"
              />
            </div>
            <Button
              variant={showOnlyMissing ? 'default' : 'outline'}
              onClick={() => {
                setShowOnlyMissing(!showOnlyMissing);
                loadSongs();
              }}
              size="sm"
            >
              {showOnlyMissing ? 'Missing Only' : 'All Songs'}
            </Button>
          </div>

          {/* Select All */}
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <Checkbox
                id="select-all"
                checked={selectedIds.size === filteredSongs.length && filteredSongs.length > 0}
                onCheckedChange={toggleAll}
              />
              <label htmlFor="select-all" className="text-sm font-medium cursor-pointer">
                Select All ({filteredSongs.length})
              </label>
            </div>
            <Badge variant="secondary">{selectedIds.size} selected</Badge>
          </div>

          {/* Song List */}
          <ScrollArea className="h-[400px] pr-4">
            {loading ? (
              <div className="text-center py-8 text-muted-foreground">Loading songs...</div>
            ) : filteredSongs.length === 0 ? (
              <div className="text-center py-8 text-muted-foreground">
                {searchQuery ? 'No songs match your search' : 'No songs found'}
              </div>
            ) : (
              <div className="space-y-2">
                {filteredSongs.map((song) => (
                  <div
                    key={song.id}
                    className={`flex items-center gap-3 p-3 rounded-lg border transition-colors cursor-pointer hover:bg-accent ${
                      selectedIds.has(song.id) ? 'bg-accent border-primary' : 'border-border'
                    }`}
                    onClick={() => toggleSong(song.id)}
                  >
                    <Checkbox
                      checked={selectedIds.has(song.id)}
                      onCheckedChange={() => toggleSong(song.id)}
                      onClick={(e) => e.stopPropagation()}
                    />

                    <div className="relative w-12 h-12 rounded-md overflow-hidden flex-shrink-0 bg-muted flex items-center justify-center border border-border">
                      {song.cover_image_url ? (
                        <Image
                          src={song.cover_image_url}
                          alt={song.title}
                          width={48}
                          height={48}
                          className="object-cover"
                        />
                      ) : (
                        <Music className="w-6 h-6 text-muted-foreground" />
                      )}
                    </div>

                    <div className="flex-1 min-w-0">
                      <div className="font-medium truncate">{song.title}</div>
                      <div className="text-sm text-muted-foreground truncate">
                        {song.author || 'Unknown Artist'}
                      </div>
                    </div>

                    {song.spotify_link_url && (
                      <CheckCircle2 className="w-5 h-5 text-green-500 flex-shrink-0" />
                    )}
                  </div>
                ))}
              </div>
            )}
          </ScrollArea>
        </div>

        <DrawerFooter>
          <Button onClick={handleConfirm} disabled={selectedIds.size === 0}>
            Sync {selectedIds.size} Song{selectedIds.size !== 1 ? 's' : ''}
          </Button>
          <DrawerClose asChild>
            <Button variant="outline">Cancel</Button>
          </DrawerClose>
        </DrawerFooter>
      </DrawerContent>
    </Drawer>
  );
}
