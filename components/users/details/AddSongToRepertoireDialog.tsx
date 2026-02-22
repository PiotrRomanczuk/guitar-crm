'use client';

import { useState, useTransition } from 'react';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Label } from '@/components/ui/label';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Textarea } from '@/components/ui/textarea';
import { Search, Music, Loader2, Check } from 'lucide-react';
import { toast } from 'sonner';
import { searchSongsForRepertoireAction, addSongToRepertoireAction } from '@/app/actions/repertoire';

interface AddSongToRepertoireDialogProps {
  studentId: string;
  children: React.ReactNode;
}

type SearchResult = { id: string; title: string; author: string; level: string | null; key: string | null };

export function AddSongToRepertoireDialog({ studentId, children }: AddSongToRepertoireDialogProps) {
  const [open, setOpen] = useState(false);
  const [step, setStep] = useState<'search' | 'configure'>('search');
  const [query, setQuery] = useState('');
  const [results, setResults] = useState<SearchResult[]>([]);
  const [selectedSong, setSelectedSong] = useState<SearchResult | null>(null);
  const [priority, setPriority] = useState('normal');
  const [teacherNotes, setTeacherNotes] = useState('');
  const [isSearching, startSearchTransition] = useTransition();
  const [isSaving, startSaveTransition] = useTransition();

  const handleSearch = () => {
    startSearchTransition(async () => {
      const result = await searchSongsForRepertoireAction(query, studentId);
      if ('error' in result) {
        toast.error(result.error);
        return;
      }
      setResults(result.data);
    });
  };

  const handleSelectSong = (song: SearchResult) => {
    setSelectedSong(song);
    setStep('configure');
  };

  const handleAdd = () => {
    if (!selectedSong) return;

    startSaveTransition(async () => {
      const result = await addSongToRepertoireAction({
        student_id: studentId,
        song_id: selectedSong.id,
        priority: priority as 'high' | 'normal' | 'low',
        teacher_notes: teacherNotes || undefined,
      });

      if ('error' in result) {
        toast.error(result.error);
        return;
      }

      toast.success(`"${selectedSong.title}" added to repertoire`);
      resetAndClose();
    });
  };

  const resetAndClose = () => {
    setOpen(false);
    setStep('search');
    setQuery('');
    setResults([]);
    setSelectedSong(null);
    setPriority('normal');
    setTeacherNotes('');
  };

  return (
    <Dialog open={open} onOpenChange={(o) => (o ? setOpen(true) : resetAndClose())}>
      <DialogTrigger asChild>{children}</DialogTrigger>
      <DialogContent className="sm:max-w-[500px]">
        <DialogHeader>
          <DialogTitle>
            {step === 'search' ? 'Add Song to Repertoire' : `Configure: ${selectedSong?.title}`}
          </DialogTitle>
        </DialogHeader>

        {step === 'search' ? (
          <div className="space-y-4">
            <div className="flex gap-2">
              <div className="relative flex-1">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                <Input
                  placeholder="Search by title or artist..."
                  value={query}
                  onChange={(e) => setQuery(e.target.value)}
                  onKeyDown={(e) => e.key === 'Enter' && handleSearch()}
                  className="pl-9"
                />
              </div>
              <Button onClick={handleSearch} disabled={isSearching}>
                {isSearching ? <Loader2 className="h-4 w-4 animate-spin" /> : 'Search'}
              </Button>
            </div>

            <div className="max-h-[300px] overflow-y-auto space-y-1">
              {results.length === 0 && !isSearching && query && (
                <p className="text-sm text-muted-foreground text-center py-6">
                  No songs found. Try a different search.
                </p>
              )}
              {results.map((song) => (
                <button
                  key={song.id}
                  onClick={() => handleSelectSong(song)}
                  className="w-full flex items-center gap-3 p-3 rounded-lg hover:bg-muted/50 transition-colors text-left"
                >
                  <div className="w-8 h-8 rounded-md bg-purple-50 dark:bg-purple-900/20 flex items-center justify-center shrink-0">
                    <Music className="h-4 w-4 text-purple-500" />
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-medium truncate">{song.title}</p>
                    <p className="text-xs text-muted-foreground">{song.author}</p>
                  </div>
                  {song.level && (
                    <span className="text-[10px] uppercase font-bold text-muted-foreground">
                      {song.level}
                    </span>
                  )}
                </button>
              ))}
            </div>
          </div>
        ) : (
          <div className="space-y-4">
            <div className="flex items-center gap-3 p-3 bg-muted/30 rounded-lg">
              <Music className="h-5 w-5 text-purple-500" />
              <div>
                <p className="font-medium text-sm">{selectedSong?.title}</p>
                <p className="text-xs text-muted-foreground">{selectedSong?.author}</p>
              </div>
            </div>

            <div className="space-y-3">
              <div>
                <Label className="text-sm">Priority</Label>
                <Select value={priority} onValueChange={setPriority}>
                  <SelectTrigger className="mt-1">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="high">High</SelectItem>
                    <SelectItem value="normal">Normal</SelectItem>
                    <SelectItem value="low">Low</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div>
                <Label className="text-sm">Teacher Notes (optional)</Label>
                <Textarea
                  value={teacherNotes}
                  onChange={(e) => setTeacherNotes(e.target.value)}
                  placeholder="e.g., Focus on strumming pattern..."
                  rows={3}
                  className="mt-1"
                />
              </div>
            </div>

            <div className="flex justify-between pt-2">
              <Button variant="outline" onClick={() => setStep('search')}>
                Back
              </Button>
              <Button onClick={handleAdd} disabled={isSaving} className="gap-1">
                {isSaving ? (
                  <Loader2 className="h-4 w-4 animate-spin" />
                ) : (
                  <Check className="h-4 w-4" />
                )}
                Add to Repertoire
              </Button>
            </div>
          </div>
        )}
      </DialogContent>
    </Dialog>
  );
}
