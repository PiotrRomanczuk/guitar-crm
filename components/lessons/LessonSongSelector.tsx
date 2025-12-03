'use client';

import { useState, useEffect } from 'react';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
  DialogFooter,
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Checkbox } from '@/components/ui/checkbox';
import { Label } from '@/components/ui/label';
import { getAvailableSongs, updateLessonSongs } from '@/app/dashboard/lessons/actions';
import { Loader2, Search } from 'lucide-react';

interface Song {
  id: string;
  title: string;
  author: string;
}

interface LessonSongSelectorProps {
  lessonId: string;
  initialSelectedSongIds: string[];
  trigger?: React.ReactNode;
}

export function LessonSongSelector({
  lessonId,
  initialSelectedSongIds,
  trigger,
}: LessonSongSelectorProps) {
  const [open, setOpen] = useState(false);
  const [songs, setSongs] = useState<Song[]>([]);
  const [selectedIds, setSelectedIds] = useState<string[]>(initialSelectedSongIds);
  const [searchQuery, setSearchQuery] = useState('');
  const [loading, setLoading] = useState(false);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (open && songs.length === 0) {
      setLoading(true);
      getAvailableSongs()
        .then(setSongs)
        .catch((err) => {
          console.error(err);
          setError('Failed to load songs');
        })
        .finally(() => setLoading(false));
    }
  }, [open, songs.length]);

  // Reset selection when modal opens/closes or initial props change
  useEffect(() => {
    if (open) {
      setSelectedIds(initialSelectedSongIds);
    }
  }, [open, initialSelectedSongIds]);

  const filteredSongs = songs.filter(
    (song) =>
      song.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
      song.author.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const handleToggle = (id: string) => {
    setSelectedIds((prev) =>
      prev.includes(id) ? prev.filter((sId) => sId !== id) : [...prev, id]
    );
  };

  const handleSave = async () => {
    setSaving(true);
    try {
      await updateLessonSongs(lessonId, selectedIds);
      setOpen(false);
    } catch (err) {
      console.error(err);
      setError('Failed to save songs');
    } finally {
      setSaving(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        {trigger || <Button variant="outline">Add Songs</Button>}
      </DialogTrigger>
      <DialogContent className="sm:max-w-[425px] max-h-[80vh] flex flex-col">
        <DialogHeader>
          <DialogTitle>Select Songs</DialogTitle>
        </DialogHeader>

        <div className="relative mb-4">
          <Search className="absolute left-2 top-2.5 h-4 w-4 text-muted-foreground" />
          <Input
            placeholder="Search songs..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="pl-8"
          />
        </div>

        <div className="flex-1 overflow-y-auto min-h-[200px] space-y-2 pr-2">
          {loading ? (
            <div className="flex justify-center py-8">
              <Loader2 className="h-6 w-6 animate-spin" />
            </div>
          ) : error ? (
            <div className="text-red-500 text-center py-4">{error}</div>
          ) : filteredSongs.length === 0 ? (
            <div className="text-center text-muted-foreground py-8">No songs found</div>
          ) : (
            filteredSongs.map((song) => (
              <div
                key={song.id}
                className="flex items-center space-x-2 p-2 hover:bg-accent rounded-md"
              >
                <Checkbox
                  id={`song-${song.id}`}
                  checked={selectedIds.includes(song.id)}
                  onCheckedChange={() => handleToggle(song.id)}
                />
                <Label htmlFor={`song-${song.id}`} className="flex-1 cursor-pointer flex flex-col">
                  <span className="font-medium">{song.title}</span>
                  <span className="text-xs text-muted-foreground">{song.author}</span>
                </Label>
              </div>
            ))
          )}
        </div>

        <DialogFooter className="mt-4">
          <Button variant="outline" onClick={() => setOpen(false)} disabled={saving}>
            Cancel
          </Button>
          <Button onClick={handleSave} disabled={saving || loading}>
            {saving && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
            Save Changes
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
