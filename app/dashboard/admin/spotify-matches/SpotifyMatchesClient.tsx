'use client';

import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import {
  Music2,
  RefreshCw,
  CheckCircle2,
  XCircle,
  ExternalLink,
  AlertCircle,
} from 'lucide-react';
import { toast } from 'sonner';
import Link from 'next/link';
import { useRouter } from 'next/navigation';

interface Song {
  id: string;
  title: string;
  author: string;
  spotify_link_url: string | null;
  cover_image_url: string | null;
  created_at?: string;
  updated_at?: string;
}

interface Stats {
  total: number;
  withSpotify: number;
  withoutSpotify: number;
  coveragePercentage: number;
}

interface SyncResult {
  total: number;
  updated: number;
  failed: number;
  skipped: number;
  errors: string[];
}

interface SpotifyMatchesClientProps {
  initialSongsWithoutSpotify: Song[];
  initialRecentlySynced: Song[];
  stats: Stats;
}

export function SpotifyMatchesClient({
  initialSongsWithoutSpotify,
  initialRecentlySynced,
  stats,
}: SpotifyMatchesClientProps) {
  const [songsWithoutSpotify, setSongsWithoutSpotify] = useState(initialSongsWithoutSpotify);
  const [recentlySynced, setRecentlySynced] = useState(initialRecentlySynced);
  const [currentStats, setCurrentStats] = useState(stats);
  const [isSyncing, setIsSyncing] = useState(false);
  const [syncResult, setSyncResult] = useState<SyncResult | null>(null);
  const router = useRouter();

  const handleSync = async (limit: number = 20, force: boolean = false) => {
    setIsSyncing(true);
    setSyncResult(null);

    try {
      const url = `/api/spotify/sync?limit=${limit}&force=${force}`;
      const response = await fetch(url, { method: 'POST' });
      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || 'Failed to sync');
      }

      setSyncResult(data);

      if (data.updated > 0) {
        toast.success(`Successfully synced ${data.updated} song(s)!`);
        // Refresh the page data
        router.refresh();
      } else if (data.skipped === data.total) {
        toast.info('No Spotify matches found for the selected songs.');
      } else {
        toast.warning(`Synced with some issues. Check the results below.`);
      }
    } catch (error: unknown) {
      const message = error instanceof Error ? error.message : 'An unknown error occurred';
      toast.error(message);
    } finally {
      setIsSyncing(false);
    }
  };

  return (
    <main className="container mx-auto px-4 sm:px-6 lg:px-8 py-6 sm:py-8 max-w-7xl space-y-6 sm:space-y-8">
      {/* Page Header */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h1 className="text-2xl sm:text-3xl font-bold tracking-tight">Spotify Matches</h1>
          <p className="text-sm text-muted-foreground mt-1">
            Manage and sync Spotify data for your song library
          </p>
        </div>
        <div className="w-full sm:w-auto flex gap-2">
          <Button
            variant="outline"
            onClick={() => handleSync(20, false)}
            disabled={isSyncing}
            className="flex-1 sm:flex-none gap-2"
          >
            <RefreshCw className={`w-4 h-4 ${isSyncing ? 'animate-spin' : ''}`} />
            {isSyncing ? 'Syncing...' : 'Sync 20'}
          </Button>
          <Button
            onClick={() => handleSync(50, false)}
            disabled={isSyncing}
            className="flex-1 sm:flex-none gap-2"
          >
            <RefreshCw className={`w-4 h-4 ${isSyncing ? 'animate-spin' : ''}`} />
            {isSyncing ? 'Syncing...' : 'Sync 50'}
          </Button>
        </div>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <Card>
          <CardHeader className="pb-3">
            <CardDescription>Total Songs</CardDescription>
            <CardTitle className="text-3xl">{currentStats.total}</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-xs text-muted-foreground">
              All songs in library
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-3">
            <CardDescription>With Spotify</CardDescription>
            <CardTitle className="text-3xl text-green-600">{currentStats.withSpotify}</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex items-center gap-2">
              <Progress value={currentStats.coveragePercentage} className="flex-1" />
              <span className="text-xs font-medium">{currentStats.coveragePercentage}%</span>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-3">
            <CardDescription>Without Spotify</CardDescription>
            <CardTitle className="text-3xl text-orange-600">{currentStats.withoutSpotify}</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-xs text-muted-foreground">
              Need to be synced
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-3">
            <CardDescription>Coverage</CardDescription>
            <CardTitle className="text-3xl">{currentStats.coveragePercentage}%</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-xs text-muted-foreground">
              {currentStats.coveragePercentage >= 80 ? 'Excellent' : currentStats.coveragePercentage >= 60 ? 'Good' : 'Needs work'}
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Sync Result */}
      {syncResult && (
        <Card className="border-primary/20 bg-primary/5">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <CheckCircle2 className="w-5 h-5 text-green-600" />
              Sync Complete
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
              <div className="bg-card rounded-lg p-3 border">
                <div className="text-xs text-muted-foreground">Total Processed</div>
                <div className="text-2xl font-bold">{syncResult.total}</div>
              </div>
              <div className="bg-card rounded-lg p-3 border border-green-200">
                <div className="text-xs text-muted-foreground">Updated</div>
                <div className="text-2xl font-bold text-green-600">{syncResult.updated}</div>
              </div>
              <div className="bg-card rounded-lg p-3 border border-orange-200">
                <div className="text-xs text-muted-foreground">Skipped</div>
                <div className="text-2xl font-bold text-orange-600">{syncResult.skipped}</div>
              </div>
              <div className="bg-card rounded-lg p-3 border border-red-200">
                <div className="text-xs text-muted-foreground">Failed</div>
                <div className="text-2xl font-bold text-red-600">{syncResult.failed}</div>
              </div>
            </div>

            {syncResult.errors.length > 0 && (
              <div className="bg-destructive/10 border border-destructive/20 rounded-lg p-4">
                <h4 className="font-medium text-sm mb-2 flex items-center gap-2">
                  <AlertCircle className="w-4 h-4" />
                  Errors ({syncResult.errors.length})
                </h4>
                <ul className="space-y-1 text-xs text-muted-foreground max-h-48 overflow-y-auto">
                  {syncResult.errors.map((error, idx) => (
                    <li key={idx}>• {error}</li>
                  ))}
                </ul>
              </div>
            )}
          </CardContent>
        </Card>
      )}

      {/* Tabs */}
      <Tabs defaultValue="pending" className="space-y-4">
        <TabsList className="grid w-full grid-cols-2">
          <TabsTrigger value="pending">
            Pending Sync ({songsWithoutSpotify.length})
          </TabsTrigger>
          <TabsTrigger value="synced">
            Recently Synced ({recentlySynced.length})
          </TabsTrigger>
        </TabsList>

        <TabsContent value="pending" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Songs Without Spotify Data</CardTitle>
              <CardDescription>
                These songs are missing Spotify links and need to be synced
              </CardDescription>
            </CardHeader>
            <CardContent>
              {songsWithoutSpotify.length === 0 ? (
                <div className="flex flex-col items-center justify-center py-12 text-center space-y-4 border-2 border-dashed border-border rounded-xl bg-muted/10">
                  <CheckCircle2 className="w-12 h-12 text-green-600/50" />
                  <div className="space-y-1">
                    <h3 className="font-semibold text-lg">All synced!</h3>
                    <p className="text-muted-foreground text-sm max-w-sm">
                      All songs in your library have Spotify data.
                    </p>
                  </div>
                </div>
              ) : (
                <div className="space-y-2">
                  {songsWithoutSpotify.map((song) => (
                    <div
                      key={song.id}
                      className="flex items-center justify-between p-3 sm:p-4 rounded-lg border hover:border-primary/30 transition-all duration-200"
                    >
                      <div className="flex items-center gap-3 min-w-0 flex-1">
                        <div className="w-10 h-10 sm:w-12 sm:h-12 bg-muted rounded-md flex items-center justify-center shrink-0">
                          <Music2 className="w-5 h-5 sm:w-6 sm:h-6 text-muted-foreground" />
                        </div>
                        <div className="min-w-0 flex-1">
                          <div className="font-medium text-sm truncate">{song.title}</div>
                          <div className="text-xs text-muted-foreground truncate">{song.author}</div>
                        </div>
                      </div>
                      <div className="flex items-center gap-2 shrink-0 ml-2">
                        <Badge variant="outline" className="bg-orange-500/10 text-orange-600 border-orange-500/20">
                          <XCircle className="w-3 h-3 mr-1" />
                          No Spotify
                        </Badge>
                        <Link href={`/dashboard/songs/${song.id}`}>
                          <Button variant="ghost" size="sm" className="h-8 px-2">
                            <ExternalLink className="w-4 h-4" />
                          </Button>
                        </Link>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="synced" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Recently Synced Songs</CardTitle>
              <CardDescription>
                Songs that were recently updated with Spotify data
              </CardDescription>
            </CardHeader>
            <CardContent>
              {recentlySynced.length === 0 ? (
                <div className="flex flex-col items-center justify-center py-12 text-center space-y-4 border-2 border-dashed border-border rounded-xl bg-muted/10">
                  <Music2 className="w-12 h-12 text-muted-foreground/50" />
                  <div className="space-y-1">
                    <h3 className="font-semibold text-lg">No recent syncs</h3>
                    <p className="text-muted-foreground text-sm max-w-sm">
                      Sync some songs to see them here.
                    </p>
                  </div>
                </div>
              ) : (
                <div className="space-y-2">
                  {recentlySynced.map((song) => (
                    <div
                      key={song.id}
                      className="flex items-center justify-between p-3 sm:p-4 rounded-lg border hover:border-primary/30 transition-all duration-200"
                    >
                      <div className="flex items-center gap-3 min-w-0 flex-1">
                        <div className="w-10 h-10 sm:w-12 sm:h-12 bg-muted rounded-md flex items-center justify-center shrink-0 overflow-hidden">
                          {song.cover_image_url ? (
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
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </main>
  );
}
