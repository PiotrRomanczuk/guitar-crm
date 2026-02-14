'use client';

import { Loader2 } from 'lucide-react';
import { useSongStatsAdvanced } from '../hooks/useSongStatsAdvanced';
import { SongStatsKPIs } from './SongStatsKPIs';
import { SongStatsKeyChart } from './SongStatsKeyChart';
import { SongStatsTempoChart } from './SongStatsTempoChart';
import { SongStatsGrowthChart } from './SongStatsGrowthChart';
import { SongStatsSunburst } from './SongStatsSunburst';

export function SongStatsPage() {
  const { data, isLoading, error } = useSongStatsAdvanced();

  if (isLoading) {
    return (
      <div className="flex justify-center p-12">
        <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
      </div>
    );
  }

  if (error || !data) {
    return (
      <div className="text-center p-12 text-muted-foreground">
        Failed to load song statistics.
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <SongStatsKPIs
        overview={data.overview}
        libraryGrowth={data.libraryGrowth}
        tempo={data.tempo}
      />
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <SongStatsKeyChart data={data.keyDistribution} />
        <SongStatsTempoChart tempo={data.tempo} />
      </div>
      <SongStatsGrowthChart data={data.libraryGrowth} />
      <SongStatsSunburst data={data.sunburst} />
    </div>
  );
}
