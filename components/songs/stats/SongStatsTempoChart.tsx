'use client';

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { ResponsiveBar } from '@nivo/bar';
import type { SongStatsAdvanced } from '@/types/SongStatsAdvanced';

interface Props {
  tempo: SongStatsAdvanced['tempo'];
}

function findGap(histogram: Array<{ bucket: string; count: number }>): string | null {
  if (histogram.length < 3) return null;
  const minCount = Math.min(...histogram.map((h) => h.count));
  const avgCount = histogram.reduce((s, h) => s + h.count, 0) / histogram.length;
  if (minCount < avgCount * 0.3) {
    const gap = histogram.find((h) => h.count === minCount);
    return gap ? gap.bucket : null;
  }
  return null;
}

export function SongStatsTempoChart({ tempo }: Props) {
  if (tempo.songsWithTempo === 0) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>Tempo Distribution</CardTitle>
          <CardDescription>No songs have tempo data yet.</CardDescription>
        </CardHeader>
      </Card>
    );
  }

  const chartData = tempo.histogram.map((item) => ({
    range: item.bucket,
    Songs: item.count,
  }));

  const gapRange = findGap(tempo.histogram);

  return (
    <Card>
      <CardHeader>
        <CardTitle>Tempo Distribution</CardTitle>
        <CardDescription>
          BPM histogram ({tempo.songsWithTempo} songs)
          <span className="ml-2 text-xs font-medium">
            {'\u2022'} Mean: {tempo.mean} | Median: {tempo.median} | {'\u03C3'} = {tempo.stdDev}
          </span>
          {gapRange && (
            <span className="block text-xs mt-1">
              Consider adding songs in {gapRange} BPM range
            </span>
          )}
        </CardDescription>
      </CardHeader>
      <CardContent>
        <div className="h-[300px] sm:h-[350px]">
          <ResponsiveBar
            data={chartData}
            keys={['Songs']}
            indexBy="range"
            margin={{ top: 20, right: 20, bottom: 50, left: 60 }}
            padding={0.3}
            valueScale={{ type: 'linear' }}
            colors={['hsl(24, 95%, 53%)']}
            borderRadius={4}
            axisTop={null}
            axisRight={null}
            axisBottom={{
              tickSize: 0,
              tickPadding: 10,
              tickRotation: -20,
              legend: 'BPM Range',
              legendPosition: 'middle',
              legendOffset: 40,
            }}
            axisLeft={{
              tickSize: 0,
              tickPadding: 10,
            }}
            enableGridY={true}
            enableLabel={true}
            labelSkipWidth={12}
            labelSkipHeight={12}
            theme={{
              axis: {
                ticks: {
                  text: {
                    fontSize: 11,
                    fill: 'hsl(var(--muted-foreground))',
                  },
                },
                legend: {
                  text: {
                    fontSize: 12,
                    fill: 'hsl(var(--muted-foreground))',
                  },
                },
              },
              grid: {
                line: {
                  stroke: 'hsl(var(--border))',
                  strokeWidth: 1,
                },
              },
              labels: {
                text: {
                  fontSize: 11,
                  fill: 'hsl(var(--background))',
                },
              },
            }}
            tooltip={({ indexValue, value, color }) => (
              <div className="bg-background border border-border rounded px-3 py-2 shadow-lg">
                <div className="flex items-center gap-2">
                  <div className="w-3 h-3 rounded-full" style={{ backgroundColor: color }} />
                  <span className="font-medium">{indexValue} BPM:</span>
                  <span>{value} songs</span>
                </div>
              </div>
            )}
          />
        </div>
      </CardContent>
    </Card>
  );
}
