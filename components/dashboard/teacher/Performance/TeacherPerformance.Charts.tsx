'use client';

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Bar, BarChart, ResponsiveContainer, XAxis, YAxis, Tooltip, Legend } from 'recharts';
import type { TeacherLessonTrend } from '@/lib/services/teacher-performance';
import { formatMonthForChart } from './performance.helpers';

interface ChartsProps {
  trends: TeacherLessonTrend[];
}

export function Charts({ trends }: ChartsProps) {
  // Transform trends data for chart
  const chartData = trends.map((trend) => ({
    name: formatMonthForChart(trend.month),
    completed: trend.completed,
    cancelled: trend.cancelled,
    scheduled: trend.scheduled,
  }));

  return (
    <Card>
      <CardHeader>
        <CardTitle>Lesson Trends</CardTitle>
        <CardDescription>Monthly lesson statistics for the last 12 months</CardDescription>
      </CardHeader>
      <CardContent>
        <div className="h-[400px]">
          <ResponsiveContainer width="100%" height="100%">
            <BarChart data={chartData}>
              <XAxis
                dataKey="name"
                fontSize={12}
                tickLine={false}
                axisLine={false}
                stroke="hsl(var(--muted-foreground))"
              />
              <YAxis
                fontSize={12}
                tickLine={false}
                axisLine={false}
                tickFormatter={(value) => `${value}`}
                stroke="hsl(var(--muted-foreground))"
              />
              <Tooltip
                contentStyle={{
                  backgroundColor: 'hsl(var(--background))',
                  borderColor: 'hsl(var(--border))',
                  borderRadius: '8px',
                }}
                itemStyle={{ color: 'hsl(var(--foreground))' }}
                cursor={{ fill: 'hsl(var(--muted))', opacity: 0.4 }}
              />
              <Legend
                wrapperStyle={{
                  paddingTop: '20px',
                }}
              />
              <Bar
                dataKey="completed"
                fill="hsl(var(--primary))"
                radius={[4, 4, 0, 0]}
                name="Completed"
              />
              <Bar
                dataKey="cancelled"
                fill="hsl(var(--destructive))"
                radius={[4, 4, 0, 0]}
                name="Cancelled"
              />
              <Bar
                dataKey="scheduled"
                fill="hsl(var(--muted-foreground))"
                radius={[4, 4, 0, 0]}
                name="Scheduled"
              />
            </BarChart>
          </ResponsiveContainer>
        </div>
      </CardContent>
    </Card>
  );
}
