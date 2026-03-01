'use client';

import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
} from 'recharts';
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from '@/components/ui/card';
import type { ProgressionLengthBucket } from '@/types/ChordAnalysis';

interface ProgressionLengthChartProps {
  data: ProgressionLengthBucket[];
}

export function ProgressionLengthChart({ data }: ProgressionLengthChartProps) {
  return (
    <Card>
      <CardHeader>
        <CardTitle>Chord Count Distribution</CardTitle>
        <CardDescription>
          How many unique chords each song uses
        </CardDescription>
      </CardHeader>
      <CardContent>
        <div className="h-[300px]">
          <ResponsiveContainer width="100%" height="100%">
            <BarChart data={data}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis
                dataKey="chordCount"
                label={{ value: 'Chords per song', position: 'insideBottom', offset: -5 }}
              />
              <YAxis
                label={{ value: 'Songs', angle: -90, position: 'insideLeft' }}
              />
              <Tooltip
                content={({ active, payload }) => {
                  if (!active || !payload?.[0]) return null;
                  const item = payload[0].payload as ProgressionLengthBucket;
                  return (
                    <div className="rounded-lg border bg-background p-3 shadow-md">
                      <p className="text-sm">
                        {item.songCount} song{item.songCount !== 1 ? 's' : ''} with {item.chordCount} chords
                      </p>
                    </div>
                  );
                }}
              />
              <Bar dataKey="songCount" fill="hsl(var(--chart-4))" radius={[4, 4, 0, 0]} />
            </BarChart>
          </ResponsiveContainer>
        </div>
      </CardContent>
    </Card>
  );
}
