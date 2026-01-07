'use client';

import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { RefreshCw } from 'lucide-react';
import { toast } from 'sonner';
import { useRouter } from 'next/navigation';
import { StatsCards } from './StatsCards';
import { SyncResultCard } from './SyncResultCard';
import { SongList } from './SongList';

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
      <StatsCards stats={currentStats} />

      {/* Sync Result */}
      {syncResult && <SyncResultCard result={syncResult} />}

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
          <SongList songs={songsWithoutSpotify} type="pending" />
        </TabsContent>

        <TabsContent value="synced" className="space-y-4">
          <SongList songs={recentlySynced} type="synced" />
        </TabsContent>
      </Tabs>
    </main>
  );
}
