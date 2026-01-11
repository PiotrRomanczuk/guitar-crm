'use client';

import { useState } from 'react';
import { RefreshCw, XCircle } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { toast } from 'sonner';
import { useRouter } from 'next/navigation';
import { Progress } from '@/components/ui/progress';
import { Card } from '@/components/ui/card';
import { SpotifyMatchDialog } from './SpotifyMatchDialog';

interface SyncSpotifyButtonProps {
  songId: string;
  songTitle?: string;
  hasSpotifyData?: boolean;
}

interface SyncStatus {
  syncing: boolean;
  progress: number;
  message: string;
}

interface SpotifyMatchData {
  matchId: string;
  songId: string;
  songTitle: string;
  spotifyTrack: {
    id: string;
    name: string;
    artist: string;
    album: string;
    coverImage: string | null;
    url: string;
    previewUrl: string | null;
    duration: number;
    releaseDate: string;
    popularity: number;
  };
  confidence: number;
  searchQuery: string;
  reason: string;
}

export function SyncSpotifyButton({
  songId,
  songTitle = '',
  hasSpotifyData = false,
}: SyncSpotifyButtonProps) {
  const [status, setStatus] = useState<SyncStatus>({ syncing: false, progress: 0, message: '' });
  const [syncId, setSyncId] = useState<string | null>(null);
  const [matchData, setMatchData] = useState<SpotifyMatchData | null>(null);
  const [showMatchDialog, setShowMatchDialog] = useState(false);
  const router = useRouter();

  const fetchMatchData = async (songId: string) => {
    try {
      const response = await fetch(`/api/spotify/matches/${songId}`);
      if (!response.ok) throw new Error('Failed to fetch match data');

      const data = await response.json();

      if (data.match) {
        setMatchData({
          matchId: data.match.id,
          songId: songId,
          songTitle: songTitle,
          spotifyTrack: {
            id: data.match.spotify_track_id,
            name: data.match.spotify_track_name,
            artist: data.match.spotify_artist_name,
            album: data.match.spotify_album_name,
            coverImage: data.match.spotify_cover_image_url,
            url: data.match.spotify_url,
            previewUrl: data.match.spotify_preview_url,
            duration: data.match.spotify_duration_ms,
            releaseDate: data.match.spotify_release_date,
            popularity: data.match.spotify_popularity,
          },
          confidence: data.match.confidence_score,
          searchQuery: data.match.search_query,
          reason: data.match.match_reason,
        });
        setShowMatchDialog(true);
      }
    } catch (error) {
      console.error('Failed to fetch match data:', error);
      toast.info('Match needs review', {
        description: 'Check the Spotify Matches page to review this match',
      });
    }
  };

  const handleSync = async (force = false) => {
    setStatus({ syncing: true, progress: 0, message: 'Starting sync...' });

    try {
      const response = await fetch('/api/spotify/sync/stream', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          songIds: [songId],
          enableAI: true,
          force,
          minConfidence: 70,
        }),
      });

      if (!response.ok) {
        throw new Error('Failed to start sync');
      }

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
                setStatus({ syncing: true, progress: 10, message: 'Initialized...' });
                break;

              case 'start':
                setStatus({ syncing: true, progress: 20, message: 'Searching Spotify...' });
                break;

              case 'progress':
                setStatus({
                  syncing: true,
                  progress: 20 + data.percentage * 0.6,
                  message: `Processing (${data.percentage}%)...`,
                });
                break;

              case 'song_updated':
                toast.success('Spotify data updated!', {
                  description: `Matched with "${data.spotifyTrack}" (${data.confidence}% confidence)`,
                });
                setStatus({ syncing: false, progress: 100, message: 'Complete!' });
                router.refresh();
                break;

              case 'song_pending':
                fetchMatchData(songId);
                setStatus({ syncing: false, progress: 100, message: 'Pending review' });
                break;

              case 'song_failed':
                toast.error('Sync failed', {
                  description: data.error || 'Unknown error',
                });
                setStatus({ syncing: false, progress: 0, message: '' });
                break;

              case 'song_skipped':
                toast.warning('No match found', {
                  description: data.reason || 'Could not find a match on Spotify',
                });
                setStatus({ syncing: false, progress: 0, message: '' });
                break;

              case 'complete':
                const results = data.results;
                if (results.updated > 0) {
                  toast.success('Sync complete!', {
                    description: 'Spotify data has been updated',
                  });
                  router.refresh();
                } else if (results.pending > 0) {
                  // Match dialog will be shown from song_pending event
                } else {
                  toast.warning('No match found', {
                    description: 'Could not find this song on Spotify',
                  });
                }
                setStatus({ syncing: false, progress: 0, message: '' });
                break;

              case 'cancelled':
                toast.info('Sync cancelled');
                setStatus({ syncing: false, progress: 0, message: '' });
                break;

              case 'error':
                throw new Error(data.error);
            }
          }
        }
      }
    } catch (error: unknown) {
      console.error('Sync error:', error);
      toast.error('Sync failed', {
        description: error instanceof Error ? error.message : 'An unknown error occurred',
      });
      setStatus({ syncing: false, progress: 0, message: '' });
    }
  };

  const handleStop = async () => {
    if (!syncId) return;

    try {
      await fetch(`/api/spotify/sync/stream?syncId=${syncId}`, {
        method: 'DELETE',
      });
      toast.info('Sync cancelled');
      setStatus({ syncing: false, progress: 0, message: '' });
      setSyncId(null);
    } catch (error) {
      console.error('Failed to stop sync:', error);
    }
  };

  return (
    <>
      <div className="space-y-2">
        {hasSpotifyData ? (
          <Button
            variant="outline"
            onClick={() => handleSync(true)}
            disabled={status.syncing}
            className="gap-2"
          >
            <RefreshCw className={`w-4 h-4 ${status.syncing ? 'animate-spin' : ''}`} />
            {status.syncing ? 'Re-syncing...' : 'Re-sync Spotify'}
          </Button>
        ) : (
          <Button
            variant="default"
            onClick={() => handleSync(false)}
            disabled={status.syncing}
            className="gap-2"
          >
            <RefreshCw className={`w-4 h-4 ${status.syncing ? 'animate-spin' : ''}`} />
            {status.syncing ? 'Syncing...' : 'Sync with Spotify'}
          </Button>
        )}

        {status.syncing && (
          <Card className="p-3 space-y-2 border-primary">
            <div className="flex items-center justify-between">
              <span className="text-sm font-medium">{status.message}</span>
              <Button variant="ghost" size="sm" onClick={handleStop}>
                <XCircle className="w-4 h-4" />
              </Button>
            </div>
            <Progress value={status.progress} className="h-1.5" />
          </Card>
        )}
      </div>

      <SpotifyMatchDialog
        open={showMatchDialog}
        onClose={() => setShowMatchDialog(false)}
        matchData={matchData}
      />
    </>
  );
}
