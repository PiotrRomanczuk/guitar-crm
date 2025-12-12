'use client';

import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Youtube } from 'lucide-react';

export default function YouTubeEmbed() {
  return (
    <Card className="bg-card border-border/50 shadow-sm overflow-hidden">
      <CardHeader className="pb-3">
        <CardTitle className="flex items-center gap-2 text-lg">
          <Youtube className="w-5 h-5 text-red-600" />
          Video Tutorial
        </CardTitle>
      </CardHeader>
      <CardContent>
        <div className="aspect-video bg-muted rounded-lg flex items-center justify-center border border-border/50">
          <div className="text-center p-6">
            <Youtube className="w-12 h-12 text-muted-foreground/50 mx-auto mb-3" />
            <p className="text-muted-foreground font-medium">No video tutorial available</p>
            <p className="text-sm text-muted-foreground/70 mt-1">
              Video tutorials will appear here once added to the song.
            </p>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
