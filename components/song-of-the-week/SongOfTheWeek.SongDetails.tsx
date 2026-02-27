'use client';

import Image from 'next/image';
import { Badge } from '@/components/ui/badge';
import { Music2, Guitar, Youtube, Play, FileText } from 'lucide-react';
import { cn } from '@/lib/utils';
import type { SongOfTheWeekWithSong } from '@/types/SongOfTheWeek';

const difficultyColors: Record<string, string> = {
  beginner: 'bg-green-500/10 text-green-500 border-green-500/20',
  intermediate: 'bg-primary/10 text-primary border-primary/20',
  advanced: 'bg-destructive/10 text-destructive border-destructive/20',
};

const difficultyLabels: Record<string, string> = {
  beginner: 'Beginner',
  intermediate: 'Intermediate',
  advanced: 'Advanced',
};

interface SongOfTheWeekSongDetailsProps {
  song: SongOfTheWeekWithSong['song'];
}

export function SongOfTheWeekSongDetails({ song }: SongOfTheWeekSongDetailsProps) {
  const hasResources = song.youtube_url || song.ultimate_guitar_link || song.spotify_link_url;

  return (
    <div className="space-y-4">
      {/* Song header with image */}
      <div className="flex items-start gap-4">
        <div className="w-14 h-14 rounded-lg bg-primary/10 flex items-center justify-center overflow-hidden relative shrink-0">
          {song.cover_image_url ? (
            <Image
              src={song.cover_image_url}
              alt={song.title}
              fill
              className="object-cover"
            />
          ) : (
            <Music2 className="w-7 h-7 text-primary" />
          )}
        </div>
        <div className="min-w-0 flex-1">
          <h3 className="font-semibold text-lg leading-tight truncate">{song.title}</h3>
          <p className="text-muted-foreground text-sm truncate">{song.author}</p>
          <Badge
            variant="outline"
            className={cn('mt-1.5 capitalize', difficultyColors[song.level || 'beginner'])}
          >
            {difficultyLabels[song.level || 'beginner']}
          </Badge>
        </div>
      </div>

      {/* Song details */}
      <div className="flex flex-wrap gap-x-4 gap-y-1.5 text-sm text-muted-foreground">
        <span className="flex items-center gap-1.5">
          <Guitar className="w-3.5 h-3.5" />
          Key: {song.key}
        </span>
        {song.chords && (
          <span className="flex items-center gap-1.5">
            <Music2 className="w-3.5 h-3.5" />
            {song.chords}
          </span>
        )}
        {song.capo_fret != null && song.capo_fret > 0 && (
          <span>Capo: fret {song.capo_fret}</span>
        )}
        {song.tempo && <span>{song.tempo} BPM</span>}
      </div>

      {/* Resource links */}
      {hasResources && (
        <div className="flex flex-wrap gap-2">
          {song.youtube_url && (
            <a
              href={song.youtube_url}
              target="_blank"
              rel="noopener noreferrer"
              className="flex items-center gap-1.5 h-8 px-3 text-xs font-medium bg-red-500 text-white rounded-md hover:bg-red-600 transition-colors"
            >
              <Youtube className="w-3.5 h-3.5" />
              YouTube
            </a>
          )}
          {song.ultimate_guitar_link && (
            <a
              href={song.ultimate_guitar_link}
              target="_blank"
              rel="noopener noreferrer"
              className="flex items-center gap-1.5 h-8 px-3 text-xs font-medium bg-yellow-500 text-white rounded-md hover:bg-yellow-600 transition-colors"
            >
              <FileText className="w-3.5 h-3.5" />
              Tabs
            </a>
          )}
          {song.spotify_link_url && (
            <a
              href={song.spotify_link_url}
              target="_blank"
              rel="noopener noreferrer"
              className="flex items-center gap-1.5 h-8 px-3 text-xs font-medium bg-green-500 text-white rounded-md hover:bg-green-600 transition-colors"
            >
              <Play className="w-3.5 h-3.5" />
              Spotify
            </a>
          )}
        </div>
      )}
    </div>
  );
}
