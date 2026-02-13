'use client';

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import {
  Bar,
  Line,
  ComposedChart,
  ResponsiveContainer,
  XAxis,
  YAxis,
  Tooltip,
  Legend,
} from 'recharts';
import type { AdvancedLessonStats } from '../hooks/useLessonStatsAdvanced';

interface Props {
  data: AdvancedLessonStats['studentGrowth'];
}

export function LessonStatsGrowthChart({ data }: Props) {
  const chartData = data.map((item) => ({
    name: new Date(item.month + '-01').toLocaleDateString('en-US', {
      month: 'short',
      year: '2-digit',
    }),
    'New Students': item.newStudents,
    'Total Students': item.cumulativeStudents,
  }));

  const tooltipStyle = {
    backgroundColor: 'hsl(var(--background))',
    borderColor: 'hsl(var(--border))',
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle>Student Growth</CardTitle>
        <CardDescription>New students per month and cumulative total</CardDescription>
      </CardHeader>
      <CardContent>
        <div className="h-[300px]">
          <ResponsiveContainer width="100%" height="100%">
            <ComposedChart data={chartData}>
              <XAxis
                dataKey="name"
                fontSize={11}
                tickLine={false}
                axisLine={false}
                interval="preserveStartEnd"
              />
              <YAxis yAxisId="left" fontSize={12} tickLine={false} axisLine={false} />
              <YAxis
                yAxisId="right"
                orientation="right"
                fontSize={12}
                tickLine={false}
                axisLine={false}
              />
              <Tooltip contentStyle={tooltipStyle} cursor={{ fill: 'hsl(var(--muted))', opacity: 0.4 }} />
              <Legend />
              <Bar
                yAxisId="left"
                dataKey="New Students"
                fill="hsl(217, 91%, 60%)"
                radius={[4, 4, 0, 0]}
              />
              <Line
                yAxisId="right"
                type="monotone"
                dataKey="Total Students"
                stroke="hsl(142, 71%, 45%)"
                strokeWidth={2}
                dot={false}
              />
            </ComposedChart>
          </ResponsiveContainer>
        </div>
      </CardContent>
    </Card>
  );
}
