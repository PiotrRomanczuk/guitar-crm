'use client';

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { ResponsiveCalendar } from '@nivo/calendar';
import { useQuery } from '@tanstack/react-query';

interface DailyLessonCount {
  day: string;
  value: number;
}

async function fetchDailyLessonData(): Promise<DailyLessonCount[]> {
  const res = await fetch('/api/lessons/stats/daily');
  if (!res.ok) throw new Error('Failed to fetch daily lesson data');
  return res.json();
}

export function LessonStatsCalendarHeatmap() {
  const { data, isLoading, error } = useQuery<DailyLessonCount[]>({
    queryKey: ['lesson-stats-daily'],
    queryFn: fetchDailyLessonData,
    staleTime: 5 * 60 * 1000,
  });

  if (isLoading) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>Daily Activity Calendar</CardTitle>
          <CardDescription>Lesson activity heatmap</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="h-[200px] flex items-center justify-center">
            <p className="text-sm text-muted-foreground">Loading...</p>
          </div>
        </CardContent>
      </Card>
    );
  }

  if (error || !data || data.length === 0) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>Daily Activity Calendar</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="h-[200px] flex items-center justify-center">
            <p className="text-sm text-muted-foreground">No data available</p>
          </div>
        </CardContent>
      </Card>
    );
  }

  const today = new Date();
  const oneYearAgo = new Date();
  oneYearAgo.setFullYear(today.getFullYear() - 1);

  return (
    <Card>
      <CardHeader>
        <CardTitle>Daily Activity Calendar</CardTitle>
        <CardDescription>Lesson activity heatmap - darker = more lessons</CardDescription>
      </CardHeader>
      <CardContent>
        <div className="h-[200px]">
          <ResponsiveCalendar
            data={data}
            from={oneYearAgo.toISOString().split('T')[0]}
            to={today.toISOString().split('T')[0]}
            emptyColor="hsl(var(--muted))"
            colors={[
              'hsl(217, 91%, 90%)',
              'hsl(217, 91%, 70%)',
              'hsl(217, 91%, 60%)',
              'hsl(217, 91%, 45%)',
            ]}
            margin={{ top: 20, right: 20, bottom: 20, left: 20 }}
            yearSpacing={40}
            monthBorderColor="hsl(var(--border))"
            dayBorderWidth={2}
            dayBorderColor="hsl(var(--background))"
            theme={{
              text: {
                fontSize: 11,
                fill: 'hsl(var(--muted-foreground))',
              },
            }}
            tooltip={({ day, value, color }) => (
              <div className="bg-background border rounded px-3 py-2 shadow-lg">
                <div className="flex flex-col gap-1">
                  <span className="text-xs font-medium">{day}</span>
                  <div className="flex items-center gap-2">
                    <div className="w-3 h-3 rounded" style={{ backgroundColor: color }} />
                    <span className="text-sm">{value} {value === 1 ? 'lesson' : 'lessons'}</span>
                  </div>
                </div>
              </div>
            )}
          />
        </div>
      </CardContent>
    </Card>
  );
}
