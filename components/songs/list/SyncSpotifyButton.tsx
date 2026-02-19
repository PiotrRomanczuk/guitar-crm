'use client';

import { useState, useRef } from 'react';
import { RefreshCw, Brain, Zap, X, Music2 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { toast } from 'sonner';
import { useRouter } from 'next/navigation';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuTrigger,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuItem,
} from '@/components/ui/dropdown-menu';
import { Progress } from '@/components/ui/progress';
import { Card } from '@/components/ui/card';
import { SongSelectionDrawer } from './SongSelectionDrawer';

interface SyncProgress {
  completed: number;
  total: number;
  percentage: number;
  currentSong?: string;
  updated: number;
  pending: number;
  failed: number;
  skipped: number;
}

export function SyncSpotifyButton() {
  const [isLoading, setIsLoading] = useState(false);
  const [progress, setProgress] = useState<SyncProgress | null>(null);
  const [syncId, setSyncId] = useState<string | null>(null);
  const [showSongSelection, setShowSongSelection] = useState(false);
  const router = useRouter();
  const eventSourceRef = useRef<EventSource | null>(null);

  const handleStop = async () => {
    if (!syncId) return;

    try {
      await fetch(`/api/spotify/sync/stream?syncId=${syncId}`, {
        method: 'DELETE',
      });

      if (eventSourceRef.current) {
        eventSourceRef.current.close();
        eventSourceRef.current = null;
      }

      toast.info('Sync cancelled');
      setIsLoading(false);
      setProgress(null);
      setSyncId(null);
    } catch (error) {
      console.error('Failed to stop sync:', error);
      toast.error('Failed to stop sync');
    }
  };

  const handleSync = async (
    options: {
      enableAI?: boolean;
      force?: boolean;
      minConfidence?: number;
      songIds?: string[];
    } = {}
  ) => {
    setIsLoading(true);
    setProgress({
      completed: 0,
      total: 0,
      percentage: 0,
      updated: 0,
      pending: 0,
      failed: 0,
      skipped: 0,
    });

    const { enableAI = true, force = false, minConfidence = 70, songIds } = options;

    try {
      // Use streaming endpoint for real-time progress
      const response = await fetch('/api/spotify/sync/stream', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          enableAI,
          force,
          minConfidence,
          songIds,
        }),
      });

      if (!response.ok) {
        throw new Error('Failed to start sync');
      }

      // Set up EventSource for SSE
      const reader = response.body?.getReader();
      const decoder = new TextDecoder();

      if (!reader) throw new Error('No response body');

      let buffer = '';

      while (true) {
        const { done, value } = await reader.read();
        if (done) break;

        buffer += decoder.decode(value, { stream: true });
        const lines = buffer.split('\n');
        buffer = lines.pop() || '';

        for (const line of lines) {
          if (line.startsWith('data: ')) {
            const data = JSON.parse(line.slice(6));

            switch (data.type) {
              case 'init':
                setSyncId(data.syncId);
                break;

              case 'start':
                setProgress({
                  completed: 0,
                  total: data.total,
                  percentage: 0,
                  updated: 0,
                  pending: 0,
                  failed: 0,
                  skipped: 0,
                });
                break;

              case 'progress':
                setProgress((prev) => ({
                  ...prev!,
                  completed: data.completed,
                  total: data.total,
                  percentage: data.percentage,
                  currentSong: data.currentSong,
                }));
                break;

              case 'song_updated':
                setProgress((prev) => ({
                  ...prev!,
                  updated: (prev?.updated || 0) + 1,
                }));
                break;

              case 'song_pending':
                setProgress((prev) => ({
                  ...prev!,
                  pending: (prev?.pending || 0) + 1,
                }));
                break;

              case 'song_failed':
                setProgress((prev) => ({
                  ...prev!,
                  failed: (prev?.failed || 0) + 1,
                }));
                break;

              case 'song_skipped':
                setProgress((prev) => ({
                  ...prev!,
                  skipped: (prev?.skipped || 0) + 1,
                }));
                break;

              case 'complete':
                const results = data.results;
                const aiInfo =
                  enableAI && results.aiMatches > 0
                    ? ` (${results.aiMatches} AI-enhanced matches)`
                    : '';

                const stats = [
                  `Updated: ${results.updated}`,
                  results.pending > 0 ? `Pending: ${results.pending}` : null,
                  `Skipped: ${results.skipped}`,
                  results.failed > 0 ? `Failed: ${results.failed}` : null,
                ]
                  .filter(Boolean)
                  .join(' • ');

                toast.success(`✅ Sync Complete${aiInfo}`, {
                  description: stats,
                  duration: 5000,
                });

                setIsLoading(false);
                setProgress(null);
                setSyncId(null);
                router.refresh();
                break;

              case 'cancelled':
                toast.info('Sync cancelled');
                setIsLoading(false);
                setProgress(null);
                setSyncId(null);
                break;

              case 'error':
                throw new Error(data.error);
            }
          }
        }
      }
    } catch (error: unknown) {
      console.error('Sync error:', error);
      toast.error('Sync Failed', {
        description: error instanceof Error ? error.message : 'An unknown error occurred',
        duration: 6000,
      });
      setIsLoading(false);
      setProgress(null);
      setSyncId(null);
    }
  };

  const handleSyncSelectedSongs = (songIds: string[]) => {
    handleSync({ enableAI: true, minConfidence: 70, songIds });
  };

  return (
    <>
      {/* Progress Display */}
      {isLoading && progress && (
        <Card className="fixed bottom-4 right-4 w-96 p-4 shadow-lg z-50 border-primary">
          <div className="space-y-3">
            <div className="flex items-center justify-between">
              <div className="font-semibold">Syncing Spotify Data</div>
              <Button variant="ghost" size="sm" onClick={handleStop}>
                <X className="w-4 h-4" />
              </Button>
            </div>

            <Progress value={progress.percentage} className="h-2" />

            <div className="text-sm text-muted-foreground">
              {progress.completed} / {progress.total} songs processed ({progress.percentage}%)
            </div>

            {progress.currentSong && (
              <div className="text-xs text-muted-foreground truncate">
                Current: {progress.currentSong}
              </div>
            )}

            <div className="grid grid-cols-4 gap-2 text-xs">
              <div className="text-center">
                <div className="font-semibold text-green-500">{progress.updated}</div>
                <div className="text-muted-foreground">Updated</div>
              </div>
              <div className="text-center">
                <div className="font-semibold text-blue-500">{progress.pending}</div>
                <div className="text-muted-foreground">Pending</div>
              </div>
              <div className="text-center">
                <div className="font-semibold text-orange-500">{progress.skipped}</div>
                <div className="text-muted-foreground">Skipped</div>
              </div>
              <div className="text-center">
                <div className="font-semibold text-red-500">{progress.failed}</div>
                <div className="text-muted-foreground">Failed</div>
              </div>
            </div>
          </div>
        </Card>
      )}

      <DropdownMenu>
        <DropdownMenuTrigger asChild>
          <Button variant="outline" disabled={isLoading} className="gap-2">
            <RefreshCw className={`w-4 h-4 ${isLoading ? 'animate-spin' : ''}`} />
            {isLoading ? 'Syncing...' : 'Sync Spotify'}
          </Button>
        </DropdownMenuTrigger>

        <DropdownMenuContent align="end" className="w-72">
          <DropdownMenuLabel className="font-medium">🎵 Spotify Sync Options</DropdownMenuLabel>
          <DropdownMenuSeparator />

          <DropdownMenuItem onClick={() => setShowSongSelection(true)} disabled={isLoading}>
            <Music2 className="w-4 h-4 mr-2 text-indigo-500" />
            <div className="flex flex-col">
              <span className="font-medium">🎯 Select Songs</span>
              <span className="text-xs text-muted-foreground">Choose specific songs to sync</span>
            </div>
          </DropdownMenuItem>

          <DropdownMenuSeparator />

          <DropdownMenuItem onClick={() => handleSync({ enableAI: true })} disabled={isLoading}>
            <Brain className="w-4 h-4 mr-2 text-purple-500" />
            <div className="flex flex-col">
              <span className="font-medium">🤖 AI-Enhanced Sync</span>
              <span className="text-xs text-muted-foreground">Smart matching for messy data</span>
            </div>
          </DropdownMenuItem>

          <DropdownMenuItem onClick={() => handleSync({ enableAI: false })} disabled={isLoading}>
            <Zap className="w-4 h-4 mr-2 text-blue-500" />
            <div className="flex flex-col">
              <span className="font-medium">⚡ Quick Sync</span>
              <span className="text-xs text-muted-foreground">Fast basic matching</span>
            </div>
          </DropdownMenuItem>

          <DropdownMenuSeparator />

          <DropdownMenuItem
            onClick={() => handleSync({ enableAI: true, minConfidence: 60 })}
            disabled={isLoading}
          >
            <RefreshCw className="w-4 h-4 mr-2 text-green-500" />
            <div className="flex flex-col">
              <span className="font-medium">🔄 Full AI Sync</span>
              <span className="text-xs text-muted-foreground">
                Lower confidence threshold (60%)
              </span>
            </div>
          </DropdownMenuItem>

          <DropdownMenuItem
            onClick={() => handleSync({ enableAI: true, force: true })}
            disabled={isLoading}
          >
            <RefreshCw className="w-4 h-4 mr-2 text-orange-500" />
            <div className="flex flex-col">
              <span className="font-medium">🔧 Force Refresh</span>
              <span className="text-xs text-muted-foreground">
                Re-sync songs with existing data
              </span>
            </div>
          </DropdownMenuItem>
        </DropdownMenuContent>
      </DropdownMenu>

      <SongSelectionDrawer
        open={showSongSelection}
        onClose={() => setShowSongSelection(false)}
        onConfirm={handleSyncSelectedSongs}
      />
    </>
  );
}
