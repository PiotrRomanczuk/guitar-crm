'use client';

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import {
  Bar,
  BarChart,
  ResponsiveContainer,
  XAxis,
  YAxis,
  Tooltip,
  Legend,
} from 'recharts';
import type { AdvancedLessonStats } from '../hooks/useLessonStatsAdvanced';

interface Props {
  data: AdvancedLessonStats['monthlyTrend'];
}

export function LessonStatsMonthlyChart({ data }: Props) {
  const chartData = data.map((item) => ({
    name: new Date(item.month + '-01').toLocaleDateString('en-US', {
      month: 'short',
      year: '2-digit',
    }),
    Completed: item.completed,
    Cancelled: item.cancelled,
    Scheduled: item.scheduled,
  }));

  const tooltipStyle = {
    backgroundColor: 'hsl(var(--background))',
    borderColor: 'hsl(var(--border))',
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle>Monthly Lesson Trend</CardTitle>
        <CardDescription>Lessons by status over time</CardDescription>
      </CardHeader>
      <CardContent>
        <div className="h-[300px] sm:h-[400px]">
          <ResponsiveContainer width="100%" height="100%">
            <BarChart data={chartData}>
              <XAxis
                dataKey="name"
                fontSize={11}
                tickLine={false}
                axisLine={false}
                interval="preserveStartEnd"
              />
              <YAxis fontSize={12} tickLine={false} axisLine={false} />
              <Tooltip contentStyle={tooltipStyle} cursor={{ fill: 'hsl(var(--muted))', opacity: 0.4 }} />
              <Legend />
              <Bar dataKey="Completed" stackId="a" fill="hsl(142, 71%, 45%)" radius={[0, 0, 0, 0]} />
              <Bar dataKey="Cancelled" stackId="a" fill="hsl(0, 84%, 60%)" radius={[0, 0, 0, 0]} />
              <Bar dataKey="Scheduled" stackId="a" fill="hsl(217, 91%, 60%)" radius={[4, 4, 0, 0]} />
            </BarChart>
          </ResponsiveContainer>
        </div>
      </CardContent>
    </Card>
  );
}
