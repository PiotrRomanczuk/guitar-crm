'use client';

import { useState } from 'react';
import Link from 'next/link';
import { Badge } from '@/components/ui/badge';
import { Music2, Guitar, ExternalLink } from 'lucide-react';
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
  },
  {
    id: '3',
    title: 'Stairway to Heaven',
    author: 'Led Zeppelin',
    level: 'advanced',
    key: 'Am',
    chords: 'Am - G#+ - C/G - D/F# - Fmaj7 - G - Am',
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
  },
  {
    id: '5',
    title: 'Nothing Else Matters',
    author: 'Metallica',
    level: 'intermediate',
    key: 'Em',
    chords: 'Em - Am - C - D - G - B7',
  },
  {
    id: '6',
    title: 'Blackbird',
    author: 'The Beatles',
    level: 'advanced',
    key: 'G',
    chords: 'G - Am7 - G/B - G - C - C#dim - D - D#dim - Em',
    ultimate_guitar_link: 'https://tabs.ultimate-guitar.com/tab/the-beatles/blackbird-chords-17609',
  },
];

export default function SongsPage() {
  const [songs] = useState<Partial<Song>[]>(dummySongs);

  return (
    <div className="min-h-screen bg-background p-8">
      <div className="mb-8 opacity-0 animate-fade-in" style={{ animationFillMode: 'forwards' }}>
        <h1 className="text-3xl font-semibold">Song Library</h1>
        <p className="text-muted-foreground mt-1">Browse and learn from our collection of songs.</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {songs.map((song, index) => (
          <div
            key={song.id}
            className="group bg-card rounded-xl border border-border overflow-hidden hover:border-primary/30 transition-all duration-300 opacity-0 animate-fade-in"
            style={{ animationDelay: `${index * 50}ms`, animationFillMode: 'forwards' }}
          >
            <div className="p-6">
              <div className="flex items-start justify-between mb-4">
                <div className="w-12 h-12 rounded-lg bg-primary/10 flex items-center justify-center">
                  <Music2 className="w-6 h-6 text-primary" />
                </div>
                <Badge
                  variant="outline"
                  className={cn('capitalize', difficultyColors[song.level || 'beginner'])}
                >
                  {difficultyLabels[song.level || 'beginner']}
                </Badge>
              </div>

              <h3 className="font-semibold text-lg mb-1 group-hover:text-primary transition-colors">
                {song.title}
              </h3>
              <p className="text-muted-foreground text-sm mb-4">{song.author}</p>

              <div className="space-y-2 mb-6">
                <div className="flex items-center text-sm text-muted-foreground">
                  <Guitar className="w-4 h-4 mr-2" />
                  Key: {song.key}
                </div>
                {song.chords && (
                  <div className="flex items-center text-sm text-muted-foreground">
                    <Music2 className="w-4 h-4 mr-2" />
                    Chords: {song.chords}
                  </div>
                )}
              </div>

              <div className="flex items-center gap-3">
                <Link
                  href={`/student/songs/${song.id}`}
                  className="flex-1 inline-flex items-center justify-center h-10 px-4 py-2 text-sm font-medium text-primary-foreground bg-primary rounded-md hover:bg-primary/90 transition-colors"
                >
                  View Details
                </Link>
                {song.ultimate_guitar_link && (
                  <a
                    href={song.ultimate_guitar_link}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="inline-flex items-center justify-center w-10 h-10 rounded-md border border-input hover:bg-accent hover:text-accent-foreground transition-colors"
                    title="View on Ultimate Guitar"
                  >
                    <ExternalLink className="w-4 h-4" />
                  </a>
                )}
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
