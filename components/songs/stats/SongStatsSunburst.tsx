'use client';

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { ResponsiveSunburst } from '@nivo/sunburst';
import type { SongStatsSunburstNode } from '@/types/SongStatsAdvanced';

interface Props {
  data: SongStatsSunburstNode;
}

export function SongStatsSunburst({ data }: Props) {
  const hasChildren = data.children && data.children.length > 0;

  if (!hasChildren) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>Song Hierarchy</CardTitle>
          <CardDescription>No data available.</CardDescription>
        </CardHeader>
      </Card>
    );
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle>Song Hierarchy</CardTitle>
        <CardDescription>
          Level &rarr; Category &rarr; Key breakdown
        </CardDescription>
      </CardHeader>
      <CardContent>
        <div className="h-[400px] sm:h-[450px]">
          <ResponsiveSunburst
            data={data}
            margin={{ top: 10, right: 10, bottom: 10, left: 10 }}
            id="name"
            value="value"
            cornerRadius={3}
            borderWidth={1}
            borderColor={{ theme: 'background' }}
            colors={{ scheme: 'paired' }}
            childColor={{ from: 'color', modifiers: [['brighter', 0.3]] }}
            enableArcLabels={true}
            arcLabelsSkipAngle={12}
            arcLabelsTextColor={{ from: 'color', modifiers: [['darker', 2]] }}
            tooltip={({ id, value, color }) => (
              <div className="bg-background border border-border rounded px-3 py-2 shadow-lg">
                <div className="flex items-center gap-2">
                  <div className="w-3 h-3 rounded-full" style={{ backgroundColor: color }} />
                  <span className="font-medium">{id}:</span>
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
