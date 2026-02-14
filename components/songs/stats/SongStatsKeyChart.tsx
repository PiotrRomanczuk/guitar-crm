'use client';

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { ResponsiveBar } from '@nivo/bar';
import * as ss from 'simple-statistics';
import type { SongStatsKeyDistribution } from '@/types/SongStatsAdvanced';

interface Props {
  data: SongStatsKeyDistribution[];
}

const CHROMATIC_ORDER = [
  'C', 'C#', 'Db', 'D', 'D#', 'Eb', 'E', 'F', 'F#', 'Gb', 'G', 'G#', 'Ab', 'A', 'A#', 'Bb', 'B',
];

function chromaticIndex(key: string): number {
  const root = key.replace('m', '');
  const idx = CHROMATIC_ORDER.indexOf(root);
  return idx === -1 ? 999 : idx;
}

export function SongStatsKeyChart({ data }: Props) {
  const majorKeys = data.filter((d) => d.isMajor);
  const minorKeys = data.filter((d) => !d.isMajor);

  // Get unique roots, sorted chromatically
  const roots = new Set<string>();
  for (const d of data) {
    roots.add(d.isMajor ? d.key : d.key.replace(/m$/, ''));
  }
  const sortedRoots = [...roots].sort((a, b) => chromaticIndex(a) - chromaticIndex(b));

  const chartData = sortedRoots.map((root) => {
    const major = majorKeys.find((k) => k.key === root);
    const minor = minorKeys.find((k) => k.key === root + 'm');
    return {
      key: root,
      Major: major?.count ?? 0,
      Minor: minor?.count ?? 0,
    };
  });

  // Identify underrepresented keys
  const counts = data.map((d) => d.count);
  let underrepresented = '';
  if (counts.length >= 3) {
    const mean = ss.mean(counts);
    const std = ss.standardDeviation(counts);
    const threshold = Math.max(1, mean - std);
    const low = data.filter((d) => d.count < threshold).map((d) => d.key);
    if (low.length > 0 && low.length <= 5) {
      underrepresented = `Underrepresented: ${low.join(', ')}`;
    }
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle>Key Distribution</CardTitle>
        <CardDescription>
          Songs grouped by musical key (major vs minor)
          {underrepresented && (
            <span className="block text-xs mt-1">{underrepresented}</span>
          )}
        </CardDescription>
      </CardHeader>
      <CardContent>
        <div className="h-[300px] sm:h-[350px]">
          <ResponsiveBar
            data={chartData}
            keys={['Major', 'Minor']}
            indexBy="key"
            margin={{ top: 20, right: 20, bottom: 50, left: 60 }}
            padding={0.3}
            groupMode="grouped"
            valueScale={{ type: 'linear' }}
            colors={['hsl(217, 91%, 60%)', 'hsl(262, 83%, 58%)']}
            borderRadius={4}
            axisTop={null}
            axisRight={null}
            axisBottom={{
              tickSize: 0,
              tickPadding: 10,
              tickRotation: -45,
            }}
            axisLeft={{
              tickSize: 0,
              tickPadding: 10,
            }}
            enableGridY={true}
            enableLabel={false}
            legends={[
              {
                dataFrom: 'keys',
                anchor: 'top',
                direction: 'row',
                translateY: -20,
                itemsSpacing: 10,
                itemWidth: 80,
                itemHeight: 20,
                symbolSize: 12,
                symbolShape: 'circle',
              },
            ]}
            theme={{
              axis: {
                ticks: {
                  text: {
                    fontSize: 11,
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
              legends: {
                text: {
                  fontSize: 12,
                  fill: 'hsl(var(--foreground))',
                },
              },
            }}
            tooltip={({ id, value, color, indexValue }) => (
              <div className="bg-background border border-border rounded px-3 py-2 shadow-lg">
                <div className="flex items-center gap-2">
                  <div className="w-3 h-3 rounded-full" style={{ backgroundColor: color }} />
                  <span className="font-medium">{indexValue} {id}:</span>
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
