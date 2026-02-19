'use client';

import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Youtube } from 'lucide-react';

interface Props {
  url?: string | null;
}

function getYouTubeId(url: string) {
  const regExp = /^.*(youtu.be\/|v\/|u\/\w\/|embed\/|watch\?v=|&v=)([^#&?]*).*/;
  const match = url.match(regExp);
  return match && match[2].length === 11 ? match[2] : null;
}

export default function YouTubeEmbed({ url }: Props) {
  const videoId = url ? getYouTubeId(url) : null;

  return (
    <Card className="bg-card border-border/50 shadow-sm overflow-hidden">
      <CardHeader className="pb-3">
        <CardTitle className="flex items-center gap-2 text-lg">
          <Youtube className="w-5 h-5 text-red-600" />
          Video Tutorial
        </CardTitle>
      </CardHeader>
      <CardContent>
        {videoId ? (
          <div className="aspect-video bg-muted rounded-lg overflow-hidden border border-border/50">
            <iframe
              width="100%"
              height="100%"
              src={`https://www.youtube.com/embed/${videoId}`}
              title="YouTube video player"
              frameBorder="0"
              allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share"
              allowFullScreen
            />
          </div>
        ) : (
          <div className="bg-muted/30 rounded-lg flex flex-col items-center justify-center border border-dashed border-border/60 py-10 px-6 text-center">
            <div className="p-3 bg-primary/5 rounded-full mb-3">
              <Youtube className="w-8 h-8 text-muted-foreground/60" />
            </div>
            <p className="text-base font-medium text-foreground mb-1">No video tutorial</p>
            <p className="text-sm text-muted-foreground max-w-[280px]">
              Add a YouTube link in the Edit page to show a playable tutorial here.
            </p>
          </div>
        )}
      </CardContent>
    </Card>
  );
}
