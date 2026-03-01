import Link from 'next/link';
import type { Song } from '../types';
import { Card, CardContent } from '@/components/ui/card';
import {
  ExternalLink,
  Guitar,
  Music2,
  Mic2,
  Tag,
  Clock,
  Timer,
  Waves,
} from 'lucide-react';
import { Button } from '@/components/ui/button';

interface Props {
  song: Song;
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

      </div>

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

      {song.chords && (
        <Card className="bg-card border-border/50 shadow-sm">
          <CardContent className="p-6">
            <div className="flex items-center justify-between mb-3">
              <p className="font-medium text-muted-foreground">Chords</p>
              {song.key && (
                <Link href={`/dashboard/fretboard?key=${encodeURIComponent(song.key)}`}>
                  <Button variant="outline" size="sm">
                    <Guitar className="w-4 h-4 mr-2" />
                    View on Fretboard
                  </Button>
                </Link>
              )}
            </div>
            <div className="p-4 bg-muted/50 rounded-lg font-[family-name:--font-music] text-sm">{song.chords}</div>
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
