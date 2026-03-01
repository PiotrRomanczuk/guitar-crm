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
import type { ProgressionFrequency } from '@/types/ChordAnalysis';

interface ProgressionBarChartProps {
  data: ProgressionFrequency[];
}

export function ProgressionBarChart({ data }: ProgressionBarChartProps) {
  const top10 = data.slice(0, 10).map((d) => ({
    ...d,
    label: d.progression.length > 30 ? d.progression.slice(0, 30) + '...' : d.progression,
  }));

  return (
    <Card>
      <CardHeader>
        <CardTitle>Top Progressions</CardTitle>
        <CardDescription>
          Most frequently occurring chord progressions (Roman numeral notation)
        </CardDescription>
      </CardHeader>
      <CardContent>
        <div className="h-[350px]">
          <ResponsiveContainer width="100%" height="100%">
            <BarChart data={top10} layout="vertical" margin={{ left: 120 }}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis type="number" />
              <YAxis
                type="category"
                dataKey="label"
                width={110}
                tick={{ fontSize: 12 }}
              />
              <Tooltip
                content={({ active, payload }) => {
                  if (!active || !payload?.[0]) return null;
                  const item = payload[0].payload as ProgressionFrequency & { label: string };
                  return (
                    <div className="rounded-lg border bg-background p-3 shadow-md">
                      <p className="font-medium text-sm">{item.progression}</p>
                      <p className="text-xs text-muted-foreground">
                        {item.count} song{item.count !== 1 ? 's' : ''}: {item.songs.slice(0, 3).join(', ')}
                        {item.songs.length > 3 ? ` +${item.songs.length - 3} more` : ''}
                      </p>
                    </div>
                  );
                }}
              />
              <Bar dataKey="count" fill="hsl(var(--chart-1))" radius={[0, 4, 4, 0]} />
            </BarChart>
          </ResponsiveContainer>
        </div>
      </CardContent>
    </Card>
  );
}
