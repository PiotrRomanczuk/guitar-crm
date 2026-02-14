'use client';

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { ResponsiveBar } from '@nivo/bar';
import * as ss from 'simple-statistics';
import type { AdvancedLessonStats } from '../hooks/useLessonStatsAdvanced';

interface Props {
  distribution: AdvancedLessonStats['scheduleDistribution'];
}

export function LessonStatsScheduleChartsNivo({ distribution }: Props) {
  const dayCounts = distribution.byDayOfWeek.map((d) => d.count);
  const hourCounts = distribution.byHourOfDay.filter((h) => h.count > 0).map((h) => h.count);

  const peakDay = distribution.byDayOfWeek.reduce((max, curr) =>
    curr.count > max.count ? curr : max
  );

  const peakHour = distribution.byHourOfDay.reduce((max, curr) =>
    curr.count > max.count ? curr : max
  );

  const dayStdDev = dayCounts.length > 0 ? ss.standardDeviation(dayCounts) : 0;
  const hourStdDev = hourCounts.length > 0 ? ss.standardDeviation(hourCounts) : 0;

  const dayData = distribution.byDayOfWeek.map((d) => ({
    day: d.day,
    lessons: d.count,
  }));

  const hourData = distribution.byHourOfDay
    .filter((h) => h.count > 0)
    .map((h) => ({ hour: h.hour, lessons: h.count }));

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
      <Card>
        <CardHeader>
          <CardTitle>By Day of Week</CardTitle>
          <CardDescription>
            Peak: {peakDay.day} ({peakDay.count} lessons) • σ = {dayStdDev.toFixed(1)}
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="h-[250px]">
            <ResponsiveBar
              data={dayData}
              keys={['lessons']}
              indexBy="day"
              margin={{ top: 20, right: 20, bottom: 50, left: 60 }}
              padding={0.3}
              colors={['hsl(var(--primary))']}
              borderRadius={4}
              axisBottom={{
                tickSize: 0,
                tickPadding: 10,
              }}
              axisLeft={{
                tickSize: 0,
                tickPadding: 10,
              }}
              enableLabel={true}
              theme={{
                axis: {
                  ticks: {
                    text: {
                      fontSize: 12,
                      fill: 'hsl(var(--muted-foreground))',
                    },
                  },
                },
                grid: {
                  line: {
                    stroke: 'hsl(var(--border))',
                  },
                },
              }}
            />
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>By Time of Day</CardTitle>
          <CardDescription>
            Peak: {peakHour.hour} ({peakHour.count} lessons) • σ = {hourStdDev.toFixed(1)}
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="h-[250px]">
            <ResponsiveBar
              data={hourData}
              keys={['lessons']}
              indexBy="hour"
              margin={{ top: 20, right: 20, bottom: 50, left: 60 }}
              padding={0.3}
              colors={['hsl(262, 83%, 58%)']}
              borderRadius={4}
              axisBottom={{
                tickSize: 0,
                tickPadding: 10,
                tickRotation: -45,
              }}
              axisLeft={{
                tickSize: 0,
                tickPadding: 10,
              }}
              enableLabel={true}
              theme={{
                axis: {
                  ticks: {
                    text: {
                      fontSize: 10,
                      fill: 'hsl(var(--muted-foreground))',
                    },
                  },
                },
                grid: {
                  line: {
                    stroke: 'hsl(var(--border))',
                  },
                },
              }}
            />
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
