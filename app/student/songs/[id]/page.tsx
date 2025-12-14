'use client';

import { useParams } from 'next/navigation';
import Link from 'next/link';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { ArrowLeft, Guitar, Music2, ExternalLink, Calendar, Clock } from 'lucide-react';
import { cn } from '@/lib/utils';
import { Song } from '@/types/Song';

const difficultyColors = {
  beginner: 'bg-green-500/10 text-green-500 border-green-500/20',
  intermediate: 'bg-primary/10 text-primary border-primary/20',
  advanced: 'bg-destructive/10 text-destructive border-destructive/20',
};

const difficultyLabels = {
  beginner: 'Beginner',
  intermediate: 'Intermediate',
  advanced: 'Advanced',
};

// Dummy data matching the Song interface
const dummySongs: Partial<Song>[] = [
  {
    id: '1',
    title: 'Wonderwall',
    author: 'Oasis',
    level: 'beginner',
    key: 'C',
    chords: 'Em7 - G - Dsus4 - A7sus4',
    ultimate_guitar_link: 'https://tabs.ultimate-guitar.com/tab/oasis/wonderwall-chords-27596',
    created_at: new Date(),
    updated_at: new Date(),
  },
  {
    id: '2',
    title: 'Hotel California',
    author: 'Eagles',
    level: 'intermediate',
    key: 'Bm',
    chords: 'Bm - F# - A - E - G - D - Em - F#',
    ultimate_guitar_link:
      'https://tabs.ultimate-guitar.com/tab/eagles/hotel-california-chords-46190',
    created_at: new Date(),
    updated_at: new Date(),
  },
  {
    id: '3',
    title: 'Stairway to Heaven',
    author: 'Led Zeppelin',
    level: 'advanced',
    key: 'Am',
    chords: 'Am - G#+ - C/G - D/F# - Fmaj7 - G - Am',
    created_at: new Date(),
    updated_at: new Date(),
  },
  {
    id: '4',
    title: 'Sweet Home Alabama',
    author: 'Lynyrd Skynyrd',
    level: 'beginner',
    key: 'G',
    chords: 'D - C - G',
    ultimate_guitar_link:
      'https://tabs.ultimate-guitar.com/tab/lynyrd-skynyrd/sweet-home-alabama-chords-106473',
    created_at: new Date(),
    updated_at: new Date(),
  },
  {
    id: '5',
    title: 'Nothing Else Matters',
    author: 'Metallica',
    level: 'intermediate',
    key: 'Em',
    chords: 'Em - Am - C - D - G - B7',
    created_at: new Date(),
    updated_at: new Date(),
  },
  {
    id: '6',
    title: 'Blackbird',
    author: 'The Beatles',
    level: 'advanced',
    key: 'G',
    chords: 'G - Am7 - G/B - G - C - C#dim - D - D#dim - Em',
    ultimate_guitar_link: 'https://tabs.ultimate-guitar.com/tab/the-beatles/blackbird-chords-17609',
    created_at: new Date(),
    updated_at: new Date(),
  },
];

export default function SongDetailPage() {
  const params = useParams();
  const id = params?.id as string;
  const song = dummySongs.find((s) => s.id === id);

  if (!song) {
    return (
      <div className="min-h-screen bg-background p-8 flex flex-col items-center justify-center">
        <h1 className="text-2xl font-bold mb-4">Song not found</h1>
        <Link href="/student/songs">
          <Button>Back to Songs</Button>
        </Link>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background p-8">
      <div
        className="max-w-4xl mx-auto opacity-0 animate-fade-in"
        style={{ animationFillMode: 'forwards' }}
      >
        <Link
          href="/student/songs"
          className="inline-flex items-center text-sm text-muted-foreground hover:text-primary mb-6 transition-colors"
        >
          <ArrowLeft className="w-4 h-4 mr-2" />
          Back to Songs
        </Link>

        <div className="bg-card rounded-xl border border-border overflow-hidden">
          <div className="p-8 border-b border-border">
            <div className="flex flex-col md:flex-row md:items-start md:justify-between gap-6">
              <div className="flex items-start gap-6">
                <div className="w-20 h-20 rounded-xl bg-primary/10 flex items-center justify-center flex-shrink-0">
                  <Music2 className="w-10 h-10 text-primary" />
                </div>
                <div>
                  <h1 className="text-3xl font-bold mb-2">{song.title}</h1>
                  <p className="text-xl text-muted-foreground mb-4">{song.author}</p>
                  <div className="flex flex-wrap gap-3">
                    <Badge
                      variant="outline"
                      className={cn('capitalize', difficultyColors[song.level || 'beginner'])}
                    >
                      {difficultyLabels[song.level || 'beginner']}
                    </Badge>
                    <Badge variant="outline" className="bg-secondary/50">
                      <Guitar className="w-3 h-3 mr-1" />
                      Key: {song.key}
                    </Badge>
                    <Badge variant="outline" className="bg-secondary/50">
                      <Calendar className="w-3 h-3 mr-1" />
                      Added:{' '}
                      {song.created_at ? new Date(song.created_at).toLocaleDateString() : 'Unknown'}
                    </Badge>
                  </div>
                </div>
              </div>

              {song.ultimate_guitar_link && (
                <Button asChild className="flex-shrink-0">
                  <a href={song.ultimate_guitar_link} target="_blank" rel="noopener noreferrer">
                    View Tabs <ExternalLink className="w-4 h-4 ml-2" />
                  </a>
                </Button>
              )}
            </div>
          </div>

          <div className="p-8 space-y-8">
            {song.chords && (
              <div>
                <h3 className="text-lg font-semibold mb-4 flex items-center">
                  <Music2 className="w-5 h-5 mr-2 text-primary" />
                  Chords Progression
                </h3>
                <div className="bg-secondary/30 rounded-lg p-6 border border-border">
                  <p className="text-lg font-mono tracking-wide">{song.chords}</p>
                </div>
              </div>
            )}

            {/* Placeholder for future content like lyrics, notes, etc. */}
            <div>
              <h3 className="text-lg font-semibold mb-4 flex items-center">
                <Clock className="w-5 h-5 mr-2 text-primary" />
                Practice History
              </h3>
              <div className="text-muted-foreground text-sm italic">
                No practice sessions recorded yet.
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
