import type { Song } from '../types';
import { Badge } from '@/components/ui/badge';
import { Card, CardContent } from '@/components/ui/card';
import { ExternalLink, Music2, Signal } from 'lucide-react';
import { Button } from '@/components/ui/button';

interface Props {
  song: Song;
}

const difficultyColors = {
  beginner: 'bg-emerald-500/15 text-emerald-700 dark:text-emerald-400 border-0',
  intermediate: 'bg-primary/10 text-primary border-0',
  advanced: 'bg-destructive/10 text-destructive border-0',
};

export default function SongDetailInfo({ song }: Props) {
  return (
    <div className="space-y-6">
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        <Card className="bg-card border-border/50 shadow-sm">
          <CardContent className="p-6 flex items-center gap-4">
            <div className="p-3 bg-primary/10 rounded-full">
              <Signal className="w-6 h-6 text-primary" />
            </div>
            <div>
              <p className="text-sm font-medium text-muted-foreground">Difficulty</p>
              <Badge
                variant="secondary"
                className={`mt-1 capitalize ${
                  difficultyColors[song.level as keyof typeof difficultyColors] || ''
                }`}
              >
                {song.level}
              </Badge>
            </div>
          </CardContent>
        </Card>

        <Card className="bg-card border-border/50 shadow-sm">
          <CardContent className="p-6 flex items-center gap-4">
            <div className="p-3 bg-primary/10 rounded-full">
              <Music2 className="w-6 h-6 text-primary" />
            </div>
            <div>
              <p className="text-sm font-medium text-muted-foreground">Key</p>
              <p className="text-lg font-semibold mt-0.5">{song.key}</p>
            </div>
          </CardContent>
        </Card>
      </div>

      {song.chords && (
        <Card className="bg-card border-border/50 shadow-sm">
          <CardContent className="p-6">
            <p className="font-medium mb-3 text-muted-foreground">Chords</p>
            <div className="p-4 bg-muted/50 rounded-lg font-mono text-sm">{song.chords}</div>
          </CardContent>
        </Card>
      )}

      {song.ultimate_guitar_link && (
        <Button variant="outline" asChild className="w-full sm:w-auto">
          <a
            href={song.ultimate_guitar_link}
            target="_blank"
            rel="noopener noreferrer"
            className="flex items-center gap-2"
          >
            <ExternalLink className="w-4 h-4" />
            View on Ultimate Guitar
          </a>
        </Button>
      )}
    </div>
  );
}
