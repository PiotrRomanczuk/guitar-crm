'use client';

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Skeleton } from '@/components/ui/skeleton';
import { useQuery } from '@tanstack/react-query';
import { Music, UserRound, Disc3, Guitar, TrendingUp } from 'lucide-react';
import { Badge } from '@/components/ui/badge';

interface SongStats {
  totalSongs: number;
  levelStats: Record<string, number>;
  songsWithChords: number;
  songsWithAudio: number;
  topAuthorsList: Array<{ author: string; count: number }>;
  averageSongsPerAuthor: number;
  recentSongs: number;
}

async function fetchSongStats(): Promise<SongStats> {
  const res = await fetch('/api/song/stats');
  if (!res.ok) throw new Error('Failed to fetch song stats');
  return res.json();
}

export function SongStatsOverview() {
  const { data, isLoading, error } = useQuery<SongStats>({
    queryKey: ['dashboard-song-stats'],
    queryFn: fetchSongStats,
    staleTime: 5 * 60 * 1000,
  });

  if (error) {
    return (
      <Card className="border-destructive/50">
        <CardHeader>
          <CardTitle className="text-destructive">Error loading song statistics</CardTitle>
          <CardDescription>
            {error instanceof Error ? error.message : 'Failed to load song statistics'}
          </CardDescription>
        </CardHeader>
      </Card>
    );
  }

  if (isLoading) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>Song Statistics</CardTitle>
          <CardDescription>Loading statistics...</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <Skeleton className="h-16 w-full" />
          <Skeleton className="h-16 w-full" />
        </CardContent>
      </Card>
    );
  }

  if (!data) {
    return null;
  }

  const uniqueAuthors = data.topAuthorsList.length;

  return (
    <Card>
      <CardHeader>
        <div>
          <CardTitle className="flex items-center gap-2">
            <Music className="h-5 w-5" />
            Song Statistics
          </CardTitle>
          <CardDescription>Overview of your song library</CardDescription>
        </div>
      </CardHeader>
      <CardContent className="space-y-4 sm:space-y-6">
        {/* Overview metrics */}
        <div className="grid grid-cols-2 sm:grid-cols-2 md:grid-cols-4 ultrawide:grid-cols-8 gap-3 sm:gap-4">
          <div className="space-y-1">
            <div className="flex items-center text-xs sm:text-sm text-muted-foreground">
              <Disc3 className="h-3.5 w-3.5 sm:h-4 sm:w-4 mr-1" />
              Total Songs
            </div>
            <div className="text-xl sm:text-2xl font-bold">{data.totalSongs}</div>
          </div>
          <div className="space-y-1">
            <div className="flex items-center text-xs sm:text-sm text-muted-foreground">
              <Guitar className="h-3.5 w-3.5 sm:h-4 sm:w-4 mr-1" />
              With Chords
            </div>
            <div className="text-xl sm:text-2xl font-bold">{data.songsWithChords}</div>
          </div>
          <div className="space-y-1">
            <div className="flex items-center text-xs sm:text-sm text-muted-foreground">
              <UserRound className="h-3.5 w-3.5 sm:h-4 sm:w-4 mr-1" />
              Authors
            </div>
            <div className="text-xl sm:text-2xl font-bold">{uniqueAuthors}</div>
          </div>
          <div className="space-y-1">
            <div className="flex items-center text-xs sm:text-sm text-muted-foreground">
              <TrendingUp className="h-3.5 w-3.5 sm:h-4 sm:w-4 mr-1" />
              Added (30d)
            </div>
            <div className="text-xl sm:text-2xl font-bold">{data.recentSongs}</div>
          </div>
        </div>

        {/* Difficulty breakdown */}
        <div className="space-y-2">
          <h4 className="text-sm font-medium">By Difficulty</h4>
          <div className="flex flex-wrap gap-2">
            {Object.entries(data.levelStats).map(([level, count]) => (
              <Badge key={level} variant="outline" className="capitalize">
                {level}: {count}
              </Badge>
            ))}
          </div>
        </div>

        {/* Top authors */}
        {data.topAuthorsList.length > 0 && (
          <div className="pt-4 border-t">
            <h4 className="text-sm font-medium mb-2">Top Authors</h4>
            <div className="flex flex-wrap gap-2">
              {data.topAuthorsList.slice(0, 5).map((item) => (
                <Badge key={item.author} variant="secondary">
                  {item.author} ({item.count})
                </Badge>
              ))}
            </div>
          </div>
        )}
      </CardContent>
    </Card>
  );
}
