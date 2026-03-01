import { Card, CardContent } from '@/components/ui/card';
import { FileText } from 'lucide-react';
import type { Song } from '../types';

interface Props {
  song: Song;
}

export default function LyricsWithChords({ song }: Props) {
  if (!song.lyrics_with_chords) return null;

  return (
    <Card className="bg-card border-border/50 shadow-sm">
      <CardContent className="p-6">
        <div className="flex items-center gap-3 mb-4">
          <div className="p-2 bg-primary/10 rounded-full">
            <FileText className="w-5 h-5 text-primary" />
          </div>
          <h3 className="text-lg font-semibold">Lyrics & Chords</h3>
        </div>
        <pre className="p-4 bg-muted/50 rounded-lg font-[family-name:--font-music] text-sm whitespace-pre-wrap max-h-[60vh] overflow-y-auto">
          {song.lyrics_with_chords}
        </pre>
      </CardContent>
    </Card>
  );
}
