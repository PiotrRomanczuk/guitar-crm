'use client';

import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Music, Users, FolderOpen, Gauge, BarChart3, TrendingUp } from 'lucide-react';
import * as ss from 'simple-statistics';
import type { SongStatsAdvanced } from '@/types/SongStatsAdvanced';

interface Props {
  overview: SongStatsAdvanced['overview'];
  libraryGrowth: SongStatsAdvanced['libraryGrowth'];
  tempo: SongStatsAdvanced['tempo'];
}

export function SongStatsKPIs({ overview, libraryGrowth, tempo }: Props) {
  let growthRate: string | null = null;
  if (libraryGrowth.length >= 3) {
    const points = libraryGrowth.map((m, i) => [i, m.cumulative] as [number, number]);
    const reg = ss.linearRegression(points);
    growthRate = `${reg.m > 0 ? '+' : ''}${reg.m.toFixed(1)} songs/month`;
  }

  const kpis = [
    {
      title: 'Total Songs',
      value: overview.totalSongs.toLocaleString(),
      icon: Music,
      color: 'text-blue-500',
      subtitle: overview.recentSongs30d > 0
        ? `+${overview.recentSongs30d} last 30 days`
        : 'No new songs recently',
    },
    {
      title: 'Authors',
      value: overview.uniqueAuthors.toLocaleString(),
      icon: Users,
      color: 'text-purple-500',
      subtitle: `~${overview.avgSongsPerAuthor} songs/author`,
    },
    {
      title: 'Categories',
      value: overview.uniqueCategories.toLocaleString(),
      icon: FolderOpen,
      color: 'text-emerald-500',
      subtitle: undefined as string | undefined,
    },
    {
      title: 'Avg Tempo',
      value: tempo.songsWithTempo > 0 ? `${tempo.mean} BPM` : 'N/A',
      icon: Gauge,
      color: 'text-amber-500',
      subtitle: tempo.songsWithTempo > 0
        ? `Median ${tempo.median} | \u03C3 = ${tempo.stdDev}`
        : undefined,
    },
    {
      title: 'Metadata Score',
      value: `${overview.metadataCompleteness}%`,
      icon: BarChart3,
      color: 'text-indigo-500',
      subtitle: 'Field completeness',
    },
    {
      title: 'Growth Rate',
      value: growthRate ?? 'N/A',
      icon: TrendingUp,
      color: 'text-green-500',
      subtitle: growthRate ? 'Linear trend' : 'Not enough data',
    },
  ];

  return (
    <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-4">
      {kpis.map((kpi) => (
        <Card key={kpi.title}>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">
              {kpi.title}
            </CardTitle>
            <kpi.icon className={`h-4 w-4 ${kpi.color}`} />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{kpi.value}</div>
            {kpi.subtitle && (
              <div className="text-xs text-muted-foreground mt-1">{kpi.subtitle}</div>
            )}
          </CardContent>
        </Card>
      ))}
    </div>
  );
}
