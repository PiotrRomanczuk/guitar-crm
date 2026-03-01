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
import type { ChordFrequency } from '@/types/ChordAnalysis';

interface ChordFrequencyChartProps {
  data: ChordFrequency[];
}

export function ChordFrequencyChart({ data }: ChordFrequencyChartProps) {
  const top20 = data.slice(0, 20);

  return (
    <Card>
      <CardHeader>
        <CardTitle>Chord Frequency</CardTitle>
        <CardDescription>
          Most commonly used individual chords across all songs
        </CardDescription>
      </CardHeader>
      <CardContent>
        <div className="h-[350px]">
          <ResponsiveContainer width="100%" height="100%">
            <BarChart data={top20}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="chord" tick={{ fontSize: 12 }} />
              <YAxis />
              <Tooltip
                content={({ active, payload }) => {
                  if (!active || !payload?.[0]) return null;
                  const item = payload[0].payload as ChordFrequency;
                  return (
                    <div className="rounded-lg border bg-background p-3 shadow-md">
                      <p className="font-medium">{item.chord}</p>
                      <p className="text-xs text-muted-foreground">
                        {item.count} uses ({item.percentage}%)
                      </p>
                    </div>
                  );
                }}
              />
              <Bar dataKey="count" fill="hsl(var(--chart-2))" radius={[4, 4, 0, 0]} />
            </BarChart>
          </ResponsiveContainer>
        </div>
      </CardContent>
    </Card>
  );
}
