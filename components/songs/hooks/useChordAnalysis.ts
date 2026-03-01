import { useQuery } from '@tanstack/react-query';
import type { ChordAnalysisData } from '@/types/ChordAnalysis';

async function fetchChordAnalysis(): Promise<ChordAnalysisData> {
  const res = await fetch('/api/song/stats/chords');
  if (!res.ok) throw new Error('Failed to fetch chord analysis');
  return res.json();
}

export function useChordAnalysis() {
  return useQuery<ChordAnalysisData>({
    queryKey: ['chord-analysis'],
    queryFn: fetchChordAnalysis,
    staleTime: 5 * 60 * 1000,
  });
}
