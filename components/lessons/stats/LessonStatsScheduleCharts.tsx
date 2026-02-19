'use client';

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Bar, BarChart, ResponsiveContainer, XAxis, YAxis, Tooltip } from 'recharts';
import type { AdvancedLessonStats } from '../hooks/useLessonStatsAdvanced';

interface Props {
  distribution: AdvancedLessonStats['scheduleDistribution'];
}

const tooltipStyle = {
  backgroundColor: 'hsl(var(--background))',
  borderColor: 'hsl(var(--border))',
};

const cursorStyle = { fill: 'hsl(var(--muted))', opacity: 0.4 };

export function LessonStatsScheduleCharts({ distribution }: Props) {
  const dayData = distribution.byDayOfWeek.map((d) => ({
    name: d.day,
    lessons: d.count,
  }));

  // Filter to only show hours with data for cleaner chart
  const hourData = distribution.byHourOfDay
    .filter((h) => h.count > 0)
    .map((h) => ({ name: h.hour, lessons: h.count }));

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
      <Card>
        <CardHeader>
          <CardTitle>By Day of Week</CardTitle>
          <CardDescription>Which days have the most lessons</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="h-[250px]">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={dayData}>
                <XAxis dataKey="name" fontSize={12} tickLine={false} axisLine={false} />
                <YAxis fontSize={12} tickLine={false} axisLine={false} />
                <Tooltip contentStyle={tooltipStyle} cursor={cursorStyle} />
                <Bar dataKey="lessons" fill="hsl(var(--primary))" radius={[4, 4, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>By Time of Day</CardTitle>
          <CardDescription>Most popular lesson hours</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="h-[250px]">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={hourData}>
                <XAxis dataKey="name" fontSize={10} tickLine={false} axisLine={false} />
                <YAxis fontSize={12} tickLine={false} axisLine={false} />
                <Tooltip contentStyle={tooltipStyle} cursor={cursorStyle} />
                <Bar dataKey="lessons" fill="hsl(262, 83%, 58%)" radius={[4, 4, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
