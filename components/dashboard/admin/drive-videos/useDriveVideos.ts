import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { toast } from 'sonner';

interface ScanResult {
  filename: string;
  driveFileId: string;
  parsed: { title: string; artist: string | null } | null;
  status: 'matched' | 'review_queue' | 'unmatched' | 'skipped';
  bestMatch: {
    songId: string;
    title: string;
    author: string;
    score: number;
  } | null;
  runnerUp: {
    songId: string;
    title: string;
    author: string;
    score: number;
  } | null;
}

interface DuplicateVideo {
  filename: string;
  driveFileId: string;
  existingSongVideo: {
    id: string;
    songId: string;
    songTitle: string;
    uploadedAt: string;
  };
}

interface ScanResponse {
  totalFiles: number;
  matched: number;
  reviewQueue: number;
  unmatched: number;
  skipped: number;
  results: ScanResult[];
  duplicates: DuplicateVideo[];
}

interface SpotifySuggestion {
  id: string;
  name: string;
  artist: string;
  album: string;
  coverUrl?: string;
  release_date: string;
}

// Query key factory
export const driveVideosKeys = {
  all: ['drive-videos'] as const,
  scan: () => [...driveVideosKeys.all, 'scan'] as const,
  synced: () => [...driveVideosKeys.all, 'synced'] as const,
  spotify: (driveFileId: string) => [...driveVideosKeys.all, 'spotify', driveFileId] as const,
};

// Fetch scan data
async function fetchScan(): Promise<ScanResponse> {
  const res = await fetch('/api/admin/drive-sync');
  if (!res.ok) {
    const errorData = await res.json().catch(() => ({ error: 'Unknown error' }));
    throw new Error(errorData.error || 'Failed to scan Drive');
  }
  return res.json();
}

// Fetch Spotify suggestion for a video
async function fetchSpotifySuggestion(
  parsed: { title: string; artist: string | null } | null
): Promise<SpotifySuggestion | null> {
  if (!parsed?.title) return null;

  const query = parsed.artist
    ? `${parsed.title} ${parsed.artist}`
    : parsed.title;

  const res = await fetch(`/api/spotify/search?q=${encodeURIComponent(query)}`);
  if (!res.ok) return null;

  const data = await res.json();
  return data.results?.[0] || null;
}

// Hook: Fetch scan data
export function useDriveScan() {
  return useQuery({
    queryKey: driveVideosKeys.scan(),
    queryFn: fetchScan,
    staleTime: 5 * 60 * 1000, // 5 minutes
    gcTime: 10 * 60 * 1000, // 10 minutes
    retry: 1,
  });
}

// Hook: Fetch Spotify suggestion for a single video
export function useSpotifySuggestion(driveFileId: string, parsed: { title: string; artist: string | null } | null) {
  return useQuery({
    queryKey: driveVideosKeys.spotify(driveFileId),
    queryFn: () => fetchSpotifySuggestion(parsed),
    enabled: !!parsed?.title,
    staleTime: 60 * 60 * 1000, // 1 hour - Spotify suggestions rarely change
    gcTime: 24 * 60 * 60 * 1000, // 24 hours
    retry: false, // Don't retry Spotify failures
  });
}

// Hook: Accept database match
export function useAcceptDatabaseMatch() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({ driveFileId, songId }: { driveFileId: string; songId: string }) => {
      const res = await fetch('/api/admin/drive-sync', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          action: 'accept-selected',
          overrides: { [driveFileId]: songId },
        }),
      });

      if (!res.ok) {
        const errorData = await res.json().catch(() => ({ error: 'Unknown error' }));
        throw new Error(errorData.error || 'Failed to accept suggestion');
      }

      return res.json();
    },
    onSuccess: (data, variables) => {
      toast.success(`Accepted database match`);
      // Invalidate scan data to refresh the list
      queryClient.invalidateQueries({ queryKey: driveVideosKeys.scan() });
      queryClient.invalidateQueries({ queryKey: driveVideosKeys.synced() });
    },
    onError: (error: Error) => {
      toast.error(error.message);
    },
  });
}

// Hook: Accept Spotify suggestion
export function useAcceptSpotifySuggestion() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({
      spotifyTrackId,
      driveFileId,
      filename,
      parsed,
    }: {
      spotifyTrackId: string;
      driveFileId: string;
      filename: string;
      parsed: { title: string; artist: string | null } | null;
    }) => {
      const res = await fetch('/api/admin/drive-videos/create-from-spotify', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          spotifyTrackId,
          driveFileId,
          videoMetadata: { filename, parsed },
        }),
      });

      if (!res.ok) {
        const errorData = await res.json().catch(() => ({ error: 'Unknown error' }));
        throw new Error(errorData.error || 'Failed to create song from Spotify');
      }

      return res.json();
    },
    onSuccess: (data) => {
      toast.success(`Created song: ${data.song.title} by ${data.song.author}`);
      queryClient.invalidateQueries({ queryKey: driveVideosKeys.scan() });
      queryClient.invalidateQueries({ queryKey: driveVideosKeys.synced() });
    },
    onError: (error: Error) => {
      toast.error(error.message);
    },
  });
}

// Hook: Accept high scores
export function useAcceptHighScores() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async () => {
      const res = await fetch('/api/admin/drive-sync', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ action: 'accept-high-scores' }),
      });

      if (!res.ok) {
        const errorData = await res.json().catch(() => ({ error: 'Unknown error' }));
        throw new Error(errorData.error || 'Failed to accept videos');
      }

      return res.json();
    },
    onSuccess: (data) => {
      toast.success(`Accepted ${data.inserted ?? 0} high-score videos`);
      queryClient.invalidateQueries({ queryKey: driveVideosKeys.scan() });
      queryClient.invalidateQueries({ queryKey: driveVideosKeys.synced() });
    },
    onError: (error: Error) => {
      toast.error(error.message);
    },
  });
}
