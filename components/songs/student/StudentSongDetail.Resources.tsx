'use client';

import Image from 'next/image';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { ExternalLink, Youtube, FileText, Play, Music2, Waves } from 'lucide-react';
import { Song } from '@/types/Song';

interface Props {
  song: Song;
}

export function SongStrummingCard({ song }: Props) {
  if (!song.strumming_pattern) return null;

  return (
    <Card className="bg-card border-border/50 shadow-sm">
      <CardContent className="p-6">
        <div className="flex items-center gap-3 mb-4">
          <div className="p-2 bg-primary/10 rounded-full">
            <Waves className="w-5 h-5 text-primary" />
          </div>
          <h3 className="text-lg font-semibold">Strumming Pattern</h3>
        </div>
        <div className="p-4 bg-muted/50 rounded-lg font-mono text-lg tracking-wider">
          {song.strumming_pattern}
        </div>
      </CardContent>
    </Card>
  );
}

export function SongChordsCard({ song }: Props) {
  if (!song.chords) return null;

  return (
    <Card className="bg-card border-border/50 shadow-sm">
      <CardContent className="p-6">
        <div className="flex items-center gap-3 mb-4">
          <div className="p-2 bg-primary/10 rounded-full">
            <Music2 className="w-5 h-5 text-primary" />
          </div>
          <h3 className="text-lg font-semibold">Chord Progression</h3>
        </div>
        <div className="p-4 bg-muted/50 rounded-lg font-mono text-sm tracking-wide">
          {song.chords}
        </div>
      </CardContent>
    </Card>
  );
}

export function SongVideoCard({ song }: Props) {
  if (!song.youtube_url) return null;

  return (
    <Card className="bg-card border-border/50 shadow-sm">
      <CardContent className="p-6">
        <div className="flex items-center gap-3 mb-4">
          <div className="p-2 bg-red-500/10 rounded-full">
            <Youtube className="w-5 h-5 text-red-500" />
          </div>
          <h3 className="text-lg font-semibold">Video Tutorial</h3>
        </div>
        <div className="aspect-video rounded-lg overflow-hidden bg-muted">
          <iframe
            src={song.youtube_url.replace('watch?v=', 'embed/')}
            title={`${song.title} - Video Tutorial`}
            className="w-full h-full"
            allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
            allowFullScreen
          />
        </div>
      </CardContent>
    </Card>
  );
}

export function SongResourceLinks({ song }: Props) {
  const hasResources =
    song.youtube_url || song.ultimate_guitar_link || song.spotify_link_url || song.audio_files;

  return (
    <Card className="bg-card border-border/50 shadow-sm">
      <CardContent className="p-6">
        <div className="flex items-center gap-3 mb-4">
          <div className="p-2 bg-primary/10 rounded-full">
            <ExternalLink className="w-5 h-5 text-primary" />
          </div>
          <h3 className="text-lg font-semibold">Learning Resources</h3>
        </div>

        {hasResources ? (
          <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-3">
            {song.youtube_url && (
              <Button variant="outline" asChild className="h-12">
                <a
                  href={song.youtube_url}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="flex items-center gap-2"
                >
                  <Youtube className="w-4 h-4" />
                  YouTube
                </a>
              </Button>
            )}

            {song.ultimate_guitar_link && (
              <Button variant="outline" asChild className="h-12">
                <a
                  href={song.ultimate_guitar_link}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="flex items-center gap-2"
                >
                  <FileText className="w-4 h-4" />
                  Tabs
                </a>
              </Button>
            )}

            {song.spotify_link_url && (
              <Button variant="outline" asChild className="h-12">
                <a
                  href={song.spotify_link_url}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="flex items-center gap-2"
                >
                  <Play className="w-4 h-4" />
                  Spotify
                </a>
              </Button>
            )}

            {song.audio_files && (
              <Button variant="outline" asChild className="h-12">
                <a
                  href={Object.values(song.audio_files)[0]}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="flex items-center gap-2"
                >
                  <Music2 className="w-4 h-4" />
                  Audio
                </a>
              </Button>
            )}
          </div>
        ) : (
          <div className="text-sm text-muted-foreground italic text-center py-4">
            No additional resources available yet
          </div>
        )}
      </CardContent>
    </Card>
  );
}

export function SongGallery({ song }: Props) {
  if (!song.gallery_images || song.gallery_images.length === 0) return null;

  return (
    <Card className="bg-card border-border/50 shadow-sm">
      <CardContent className="p-6">
        <h3 className="text-lg font-semibold mb-4">Gallery</h3>
        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
          {song.gallery_images.map((image, index) => (
            <div key={index} className="relative aspect-square rounded-lg overflow-hidden">
              <Image
                src={image}
                alt={`${song.title} gallery image ${index + 1}`}
                fill
                className="object-cover hover:scale-105 transition-transform cursor-pointer"
              />
            </div>
          ))}
        </div>
      </CardContent>
    </Card>
  );
}

export function SongNotes({ song }: Props) {
  if (!song.comments) return null;

  return (
    <Card className="bg-card border-border/50 shadow-sm">
      <CardContent className="p-6">
        <h3 className="text-lg font-semibold mb-4">Notes</h3>
        <div className="prose prose-sm max-w-none">
          <p className="text-muted-foreground">{song.comments}</p>
        </div>
      </CardContent>
    </Card>
  );
}
