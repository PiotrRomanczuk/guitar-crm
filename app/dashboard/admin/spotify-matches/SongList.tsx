import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Music2, XCircle, ExternalLink, CheckCircle2 } from 'lucide-react';
import Link from 'next/link';

interface Song {
  id: string;
  title: string;
  author: string;
  spotify_link_url: string | null;
  cover_image_url: string | null;
}

interface SongListProps {
  songs: Song[];
  type: 'pending' | 'synced';
}

export function SongList({ songs, type }: SongListProps) {
  const isPending = type === 'pending';
  const title = isPending ? 'Songs Without Spotify Data' : 'Recently Synced Songs';
  const description = isPending
    ? 'These songs are missing Spotify links and need to be synced'
    : 'Songs that were recently updated with Spotify data';

  const emptyIcon = isPending ? XCircle : Music2;
  const emptyTitle = isPending ? 'All synced!' : 'No recent syncs';
  const emptyDescription = isPending
    ? 'All songs in your library have Spotify data.'
    : 'Sync some songs to see them here.';

  return (
    <Card>
      <CardHeader>
        <CardTitle>{title}</CardTitle>
        <CardDescription>{description}</CardDescription>
      </CardHeader>
      <CardContent>
        {songs.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-12 text-center space-y-4 border-2 border-dashed border-border rounded-xl bg-muted/10">
            {isPending ? (
              <CheckCircle2 className="w-12 h-12 text-green-600/50" />
            ) : (
              <Music2 className="w-12 h-12 text-muted-foreground/50" />
            )}
            <div className="space-y-1">
              <h3 className="font-semibold text-lg">{emptyTitle}</h3>
              <p className="text-muted-foreground text-sm max-w-sm">
                {emptyDescription}
              </p>
            </div>
          </div>
        ) : (
          <div className="space-y-2">
            {songs.map((song) => (
              <SongItem key={song.id} song={song} type={type} />
            ))}
          </div>
        )}
      </CardContent>
    </Card>
  );
}

interface SongItemProps {
  song: Song;
  type: 'pending' | 'synced';
}

function SongItem({ song, type }: SongItemProps) {
  const isPending = type === 'pending';

  return (
    <div className="flex items-center justify-between p-3 sm:p-4 rounded-lg border hover:border-primary/30 transition-all duration-200">
      <div className="flex items-center gap-3 min-w-0 flex-1">
        <div className="w-10 h-10 sm:w-12 sm:h-12 bg-muted rounded-md flex items-center justify-center shrink-0 overflow-hidden">
          {song.cover_image_url && !isPending ? (
            <img
              src={song.cover_image_url}
              alt={song.title}
              className="w-full h-full object-cover"
            />
          ) : (
            <Music2 className="w-5 h-5 sm:w-6 sm:h-6 text-muted-foreground" />
          )}
        </div>
        <div className="min-w-0 flex-1">
          <div className="font-medium text-sm truncate">{song.title}</div>
          <div className="text-xs text-muted-foreground truncate">{song.author}</div>
        </div>
      </div>
      <div className="flex items-center gap-2 shrink-0 ml-2">
        {isPending ? (
          <>
            <Badge variant="outline" className="bg-orange-500/10 text-orange-600 border-orange-500/20">
              <XCircle className="w-3 h-3 mr-1" />
              No Spotify
            </Badge>
            <Link href={`/dashboard/songs/${song.id}`}>
              <Button variant="ghost" size="sm" className="h-8 px-2">
                <ExternalLink className="w-4 h-4" />
              </Button>
            </Link>
          </>
        ) : (
          <>
            <Badge variant="outline" className="bg-green-500/10 text-green-600 border-green-500/20">
              <CheckCircle2 className="w-3 h-3 mr-1" />
              Synced
            </Badge>
            {song.spotify_link_url && (
              <a
                href={song.spotify_link_url}
                target="_blank"
                rel="noopener noreferrer"
              >
                <Button variant="ghost" size="sm" className="h-8 px-2">
                  <ExternalLink className="w-4 h-4" />
                </Button>
              </a>
            )}
          </>
        )}
      </div>
    </div>
  );
}
