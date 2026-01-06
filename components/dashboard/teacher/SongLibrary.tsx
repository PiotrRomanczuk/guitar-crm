import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Clock, Music2, Star, Plus } from 'lucide-react';
import { cn } from '@/lib/utils';
import Link from 'next/link';

interface Song {
  id: string;
  title: string;
  artist: string;
  difficulty: 'Easy' | 'Medium' | 'Hard';
  duration: string;
  studentsLearning: number;
}

interface SongLibraryProps {
  songs: Song[];
}

const difficultyColors = {
  Easy: 'bg-emerald-500/15 text-emerald-700 dark:text-emerald-400 border-0',
  Medium: 'bg-primary/10 text-primary border-0',
  Hard: 'bg-destructive/10 text-destructive border-0',
};

export function SongLibrary({ songs }: SongLibraryProps) {
  return (
    <div
      className="bg-card rounded-xl border border-border overflow-hidden opacity-0 animate-fade-in"
      style={{ animationDelay: '250ms', animationFillMode: 'forwards' }}
    >
      <div className="p-6 border-b border-border">
        <h3 className="font-semibold">Song Library</h3>
        <p className="text-sm text-muted-foreground mt-1">Popular songs being taught</p>
      </div>

      {songs.length === 0 ? (
        <div className="p-12 text-center">
          <div className="flex justify-center mb-4">
            <div className="w-16 h-16 rounded-full bg-muted flex items-center justify-center">
              <Music2 className="w-8 h-8 text-muted-foreground" />
            </div>
          </div>
          <h3 className="text-lg font-semibold mb-2">No Songs in Library</h3>
          <p className="text-sm text-muted-foreground mb-6 max-w-sm mx-auto">
            Add songs to your library to assign them to students and track their learning progress.
          </p>
          <Link href="/dashboard/songs">
            <Button>
              <Plus className="w-4 h-4 mr-2" />
              Add Song
            </Button>
          </Link>
        </div>
      ) : (
        <div className="divide-y divide-border">
          {songs.map((song) => (
          <div key={song.id} className="p-4 hover:bg-muted/50 transition-colors">
            <div className="flex items-start gap-4">
              <div className="w-12 h-12 rounded-lg bg-primary/10 flex items-center justify-center flex-shrink-0">
                <Music2 className="w-6 h-6 text-primary" />
              </div>

              <div className="flex-1 min-w-0">
                <p className="font-medium truncate">{song.title}</p>
                <p className="text-sm text-muted-foreground">{song.artist}</p>

                <div className="flex items-center gap-3 mt-2">
                  <Badge
                    variant="outline"
                    className={cn('text-xs', difficultyColors[song.difficulty])}
                  >
                    {song.difficulty}
                  </Badge>
                  <span className="text-xs text-muted-foreground flex items-center gap-1">
                    <Clock className="w-3 h-3" />
                    {song.duration}
                  </span>
                  <span className="text-xs text-muted-foreground flex items-center gap-1">
                    <Star className="w-3 h-3" />
                    {song.studentsLearning} students
                  </span>
                </div>
              </div>
            </div>
          </div>
        ))}
        </div>
      )}
    </div>
  );
}
