'use client';

import { Badge } from '@/components/ui/badge';
import { Card, CardContent } from '@/components/ui/card';
import { Signal, Music2, Timer, Clock, Calendar, Mic2, Tag } from 'lucide-react';
import { cn } from '@/lib/utils';
import { Song } from '@/types/Song';
import { getStatusBadgeClasses } from '@/lib/utils/status-colors';

interface Props {
  song: Song;
}

function formatDuration(ms: number): string {
  const minutes = Math.floor(ms / 60000);
  const seconds = ((ms % 60000) / 1000).toFixed(0);
  return `${minutes}:${Number(seconds) < 10 ? '0' : ''}${seconds}`;
}

const difficultyLabels: Record<string, string> = {
  beginner: 'Beginner',
  intermediate: 'Intermediate',
  advanced: 'Advanced',
};

interface InfoCardProps {
  icon: React.ReactNode;
  label: string;
  children: React.ReactNode;
}

function InfoCard({ icon, label, children }: InfoCardProps) {
  return (
    <Card className="bg-card border-border/50 shadow-sm">
      <CardContent className="p-6 flex items-center gap-4">
        <div className="p-3 bg-primary/10 rounded-full">{icon}</div>
        <div>
          <p className="text-sm font-medium text-muted-foreground">{label}</p>
          {children}
        </div>
      </CardContent>
    </Card>
  );
}

export function StudentSongDetailInfoGrid({ song }: Props) {
  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
      <InfoCard icon={<Signal className="w-6 h-6 text-primary" />} label="Difficulty">
        <Badge
          variant="secondary"
          className={cn('mt-1 capitalize', getStatusBadgeClasses('songLevel', song.level || 'beginner'))}
        >
          {difficultyLabels[song.level || 'beginner']}
        </Badge>
      </InfoCard>

      <InfoCard icon={<Music2 className="w-6 h-6 text-primary" />} label="Key">
        <p className="text-lg font-semibold mt-0.5">{song.key}</p>
      </InfoCard>

      {song.tempo && (
        <InfoCard icon={<Timer className="w-6 h-6 text-primary" />} label="Tempo">
          <p className="text-lg font-semibold mt-0.5">{song.tempo} BPM</p>
        </InfoCard>
      )}

      {song.time_signature && (
        <InfoCard icon={<Clock className="w-6 h-6 text-primary" />} label="Time Sig.">
          <p className="text-lg font-semibold mt-0.5">{song.time_signature}/4</p>
        </InfoCard>
      )}

      {song.duration_ms && (
        <InfoCard icon={<Clock className="w-6 h-6 text-primary" />} label="Duration">
          <p className="text-lg font-semibold mt-0.5">{formatDuration(song.duration_ms)}</p>
        </InfoCard>
      )}

      {song.release_year && (
        <InfoCard icon={<Calendar className="w-6 h-6 text-primary" />} label="Released">
          <p className="text-lg font-semibold mt-0.5">{song.release_year}</p>
        </InfoCard>
      )}

      {song.capo_fret !== null && song.capo_fret !== undefined && (
        <InfoCard icon={<Mic2 className="w-6 h-6 text-primary" />} label="Capo">
          <p className="text-lg font-semibold mt-0.5">
            {song.capo_fret === 0 ? 'No Capo' : `Fret ${song.capo_fret}`}
          </p>
        </InfoCard>
      )}

      {song.category && (
        <InfoCard icon={<Tag className="w-6 h-6 text-primary" />} label="Category">
          <p className="text-lg font-semibold mt-0.5">{song.category}</p>
        </InfoCard>
      )}
    </div>
  );
}
