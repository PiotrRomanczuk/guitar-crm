import type { Song } from '../types';
import { Badge } from '@/components/ui/badge';
import { Card, CardContent } from '@/components/ui/card';
import {
  ExternalLink,
  Music2,
  Signal,
  Mic2,
  Waves,
  Tag,
  Clock,
  Calendar,
  Timer,
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import Image from 'next/image';

interface Props {
  song: Song;
}

const difficultyColors = {
  beginner: 'bg-success/15 text-success border-0',
  intermediate: 'bg-primary/10 text-primary border-0',
  advanced: 'bg-destructive/10 text-destructive border-0',
};

function formatDuration(ms: number): string {
  const minutes = Math.floor(ms / 60000);
  const seconds = ((ms % 60000) / 1000).toFixed(0);
  return `${minutes}:${Number(seconds) < 10 ? '0' : ''}${seconds}`;
}

export default function SongDetailInfo({ song }: Props) {
  return (
    <div className="space-y-6">
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">

        {song.tempo && (
          <Card className="bg-card border-border/50 shadow-sm">
            <CardContent className="p-6 flex items-center gap-4">
              <div className="p-3 bg-primary/10 rounded-full">
                <Timer className="w-6 h-6 text-primary" />
              </div>
              <div>
                <p className="text-sm font-medium text-muted-foreground">Tempo</p>
                <p className="text-lg font-semibold mt-0.5">{song.tempo} BPM</p>
              </div>
            </CardContent>
          </Card>
        )}

        {song.time_signature && (
          <Card className="bg-card border-border/50 shadow-sm">
            <CardContent className="p-6 flex items-center gap-4">
              <div className="p-3 bg-primary/10 rounded-full">
                <Clock className="w-6 h-6 text-primary" />
              </div>
              <div>
                <p className="text-sm font-medium text-muted-foreground">Time Sig.</p>
                <p className="text-lg font-semibold mt-0.5">{song.time_signature}/4</p>
              </div>
            </CardContent>
          </Card>
        )}

        {song.duration_ms && (
          <Card className="bg-card border-border/50 shadow-sm">
            <CardContent className="p-6 flex items-center gap-4">
              <div className="p-3 bg-primary/10 rounded-full">
                <Clock className="w-6 h-6 text-primary" />
              </div>
              <div>
                <p className="text-sm font-medium text-muted-foreground">Duration</p>
                <p className="text-lg font-semibold mt-0.5">{formatDuration(song.duration_ms)}</p>
              </div>
            </CardContent>
          </Card>
        )}

        {song.release_year && (
          <Card className="bg-card border-border/50 shadow-sm">
            <CardContent className="p-6 flex items-center gap-4">
              <div className="p-3 bg-primary/10 rounded-full">
                <Calendar className="w-6 h-6 text-primary" />
              </div>
              <div>
                <p className="text-sm font-medium text-muted-foreground">Released</p>
                <p className="text-lg font-semibold mt-0.5">{song.release_year}</p>
              </div>
            </CardContent>
          </Card>
        )}

        {song.capo_fret !== null && song.capo_fret !== undefined && (
          <Card className="bg-card border-border/50 shadow-sm">
            <CardContent className="p-6 flex items-center gap-4">
              <div className="p-3 bg-primary/10 rounded-full">
                <Mic2 className="w-6 h-6 text-primary" />
              </div>
              <div>
                <p className="text-sm font-medium text-muted-foreground">Capo</p>
                <p className="text-lg font-semibold mt-0.5">
                  {song.capo_fret === 0 ? 'No Capo' : `Fret ${song.capo_fret}`}
                </p>
              </div>
            </CardContent>
          </Card>
        )}

        {song.category && (
          <Card className="bg-card border-border/50 shadow-sm">
            <CardContent className="p-6 flex items-center gap-4">
              <div className="p-3 bg-primary/10 rounded-full">
                <Tag className="w-6 h-6 text-primary" />
              </div>
              <div>
                <p className="text-sm font-medium text-muted-foreground">Category</p>
                <p className="text-lg font-semibold mt-0.5">{song.category}</p>
              </div>
            </CardContent>
          </Card>
        )}

        {song.strumming_pattern && (
          <Card className="bg-card border-border/50 shadow-sm">
            <CardContent className="p-6 flex items-center gap-4">
              <div className="p-3 bg-primary/10 rounded-full">
                <Waves className="w-6 h-6 text-primary" />
              </div>
              <div>
                <p className="text-sm font-medium text-muted-foreground">Strumming</p>
                <p className="text-lg font-semibold mt-0.5">{song.strumming_pattern}</p>
              </div>
            </CardContent>
          </Card>
        )}
      </div>

      {song.strumming_pattern && (
        <Card className="bg-card border-border/50 shadow-sm">
          <CardContent className="p-6 flex items-center gap-4">
            <div className="p-3 bg-primary/10 rounded-full">
              <Waves className="w-6 h-6 text-primary" />
            </div>
            <div>
              <p className="text-sm font-medium text-muted-foreground">Strumming Pattern</p>
              <p className="text-lg font-semibold mt-0.5 font-mono">{song.strumming_pattern}</p>
            </div>
          </CardContent>
        </Card>
      )}

      {song.chords && (
        <Card className="bg-card border-border/50 shadow-sm">
          <CardContent className="p-6">
            <p className="font-medium mb-3 text-muted-foreground">Chords</p>
            <div className="p-4 bg-muted/50 rounded-lg font-mono text-sm">{song.chords}</div>
          </CardContent>
        </Card>
      )}

      {song.tiktok_short_url && (
        <Card className="bg-card border-border/50 shadow-sm">
          <CardContent className="p-6">
            <div className="flex items-center gap-2 mb-4">
              <Music2 className="w-5 h-5 text-primary" />
              <p className="font-medium text-muted-foreground">Practice Short</p>
            </div>
            <div className="aspect-[9/16] max-w-[315px] mx-auto rounded-lg overflow-hidden bg-black">
              <iframe
                src={song.tiktok_short_url.replace('/video/', '/embed/')}
                className="w-full h-full"
                allowFullScreen
                allow="autoplay; encrypted-media; picture-in-picture"
                title="TikTok Practice Short"
              />
            </div>
            <p className="text-sm text-muted-foreground mt-3 text-center">
              Loop this short for practice
            </p>
          </CardContent>
        </Card>
      )}

      {(song.ultimate_guitar_link || song.spotify_link_url || song.tiktok_short_url) && (
        <div className="pt-2">
          <h3 className="text-sm font-medium text-muted-foreground mb-3">External Resources</h3>
          <div className="flex flex-wrap gap-4">
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

            {song.spotify_link_url && (
              <Button variant="outline" asChild className="w-full sm:w-auto">
                <a
                  href={song.spotify_link_url}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="flex items-center gap-2"
                >
                  <ExternalLink className="w-4 h-4" />
                  Listen on Spotify
                </a>
              </Button>
            )}

            {song.tiktok_short_url && (
              <Button variant="outline" asChild className="w-full sm:w-auto">
                <a
                  href={song.tiktok_short_url}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="flex items-center gap-2"
                >
                  <ExternalLink className="w-4 h-4" />
                  Open in TikTok
                </a>
              </Button>
            )}
          </div>
        </div>
      )}
    </div>
  );
}
