import { useQuery } from '@tanstack/react-query';
import type { SongStatsAdvanced } from '@/types/SongStatsAdvanced';

async function fetchSongStatsAdvanced(): Promise<SongStatsAdvanced> {
  const res = await fetch('/api/song/stats/advanced');
  if (!res.ok) throw new Error('Failed to fetch advanced song stats');
  return res.json();
}

export function useSongStatsAdvanced() {
  return useQuery<SongStatsAdvanced>({
    queryKey: ['song-stats-advanced'],
    queryFn: fetchSongStatsAdvanced,
    staleTime: 5 * 60 * 1000,
  });
}
