import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Music, PlayCircle } from 'lucide-react';
import Link from 'next/link';
import { Button } from '@/components/ui/button';

interface Song {
  id: string;
  title: string;
  artist: string;
  last_played: string;
}

interface RecentSongsCardProps {
  songs: Song[];
}

export function RecentSongsCard({ songs }: RecentSongsCardProps) {
  return (
    <Card className="h-full flex flex-col">
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Music className="h-5 w-5 text-primary" />
          Recent Songs
        </CardTitle>
      </CardHeader>
      <CardContent className="flex-1 flex flex-col">
        {songs.length === 0 ? (
          <p className="text-muted-foreground text-sm">No songs practiced recently.</p>
        ) : (
          <div className="space-y-3">
            {songs.map((song) => (
              <div
                key={song.id}
                className="flex items-center gap-3 p-2 rounded-md hover:bg-muted/50 transition-colors group"
              >
                <div className="h-8 w-8 rounded-full bg-primary/10 flex items-center justify-center text-primary">
                  <Music className="h-4 w-4" />
                </div>
                <div className="flex-1 min-w-0">
                  <p className="font-medium text-sm truncate">{song.title}</p>
                  <p className="text-xs text-muted-foreground truncate">{song.artist}</p>
                </div>
                <Button
                  asChild
                  size="icon"
                  variant="ghost"
                  className="h-8 w-8 opacity-0 group-hover:opacity-100 transition-opacity"
                >
                  <Link href={`/dashboard/songs/${song.id}`}>
                    <PlayCircle className="h-4 w-4" />
                    <span className="sr-only">View Song</span>
                  </Link>
                </Button>
              </div>
            ))}
          </div>
        )}

        <div className="mt-auto pt-4">
          <Button
            asChild
            variant="ghost"
            size="sm"
            className="w-full text-muted-foreground hover:text-primary"
          >
            <Link href="/dashboard/songs">Browse Song Library</Link>
          </Button>
        </div>
      </CardContent>
    </Card>
  );
}
