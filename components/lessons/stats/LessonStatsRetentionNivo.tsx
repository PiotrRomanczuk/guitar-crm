'use client';

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { ResponsiveBar } from '@nivo/bar';
import { Users, UserCheck, UserX, Clock } from 'lucide-react';
import * as ss from 'simple-statistics';
import type { AdvancedLessonStats } from '../hooks/useLessonStatsAdvanced';

interface Props {
  retention: AdvancedLessonStats['retention'];
}

export function LessonStatsRetentionNivo({ retention }: Props) {
  const lifetimeValues = retention.lifetimeHistogram.map((item) => item.count);
  const totalStudents = retention.activeStudents + retention.churnedStudents;
  const churnRate = totalStudents > 0 ? (retention.churnedStudents / totalStudents) * 100 : 0;
  const retentionRate = 100 - churnRate;

  const medianLifetime =
    lifetimeValues.length > 0 ? ss.median(lifetimeValues) : retention.avgLifetimeMonths;

  const histogramData = retention.lifetimeHistogram.map((item) => ({
    bucket: item.bucket,
    students: item.count,
  }));

  const kpis = [
    {
      label: 'Avg Lifetime',
      value: `${retention.avgLifetimeMonths} mo`,
      icon: Clock,
      color: 'text-blue-500',
      subtitle: `Median: ${medianLifetime.toFixed(1)} mo`,
    },
    {
      label: 'Active',
      value: retention.activeStudents.toString(),
      icon: UserCheck,
      color: 'text-green-500',
      subtitle: `${retentionRate.toFixed(1)}% retention`,
    },
    {
      label: 'Churned',
      value: retention.churnedStudents.toString(),
      icon: UserX,
      color: 'text-red-500',
      subtitle: `${churnRate.toFixed(1)}% churn`,
    },
    {
      label: 'Total',
      value: totalStudents.toString(),
      icon: Users,
      color: 'text-purple-500',
    },
  ];

  return (
    <Card>
      <CardHeader>
        <CardTitle>Student Retention Analysis</CardTitle>
        <CardDescription>
          Active = lesson within last 3 months. Lifetime = first to last lesson.
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-6">
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          {kpis.map((kpi) => (
            <div key={kpi.label} className="text-center">
              <kpi.icon className={`h-5 w-5 mx-auto mb-1 ${kpi.color}`} />
              <div className="text-xl font-bold">{kpi.value}</div>
              <div className="text-xs text-muted-foreground">{kpi.label}</div>
              {kpi.subtitle && (
                <div className="text-xs text-muted-foreground mt-0.5">{kpi.subtitle}</div>
              )}
            </div>
          ))}
        </div>

        <div>
          <h4 className="text-sm font-medium mb-3">Student Lifetime Distribution</h4>
          <div className="h-[250px]">
            <ResponsiveBar
              data={histogramData}
              keys={['students']}
              indexBy="bucket"
              margin={{ top: 20, right: 20, bottom: 50, left: 60 }}
              padding={0.3}
              colors={['hsl(262, 83%, 58%)']}
              borderRadius={4}
              axisBottom={{
                tickSize: 0,
                tickPadding: 10,
                tickRotation: -20,
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
                      fontSize: 11,
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
        </div>
      </CardContent>
    </Card>
  );
}
