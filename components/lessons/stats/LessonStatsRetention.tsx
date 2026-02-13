'use client';

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Bar, BarChart, ResponsiveContainer, XAxis, YAxis, Tooltip } from 'recharts';
import { Users, UserCheck, UserX, Clock } from 'lucide-react';
import type { AdvancedLessonStats } from '../hooks/useLessonStatsAdvanced';

interface Props {
  retention: AdvancedLessonStats['retention'];
}

export function LessonStatsRetention({ retention }: Props) {
  const histogramData = retention.lifetimeHistogram.map((item) => ({
    name: item.bucket,
    students: item.count,
  }));

  const tooltipStyle = {
    backgroundColor: 'hsl(var(--background))',
    borderColor: 'hsl(var(--border))',
  };

  const kpis = [
    {
      label: 'Avg Lifetime',
      value: `${retention.avgLifetimeMonths} mo`,
      icon: Clock,
      color: 'text-blue-500',
    },
    {
      label: 'Active',
      value: retention.activeStudents.toString(),
      icon: UserCheck,
      color: 'text-green-500',
    },
    {
      label: 'Churned',
      value: retention.churnedStudents.toString(),
      icon: UserX,
      color: 'text-red-500',
    },
    {
      label: 'Total',
      value: (retention.activeStudents + retention.churnedStudents).toString(),
      icon: Users,
      color: 'text-purple-500',
    },
  ];

  return (
    <Card>
      <CardHeader>
        <CardTitle>Student Retention</CardTitle>
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
            </div>
          ))}
        </div>

        <div>
          <h4 className="text-sm font-medium mb-3">Student Lifetime Distribution</h4>
          <div className="h-[200px]">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={histogramData}>
                <XAxis dataKey="name" fontSize={11} tickLine={false} axisLine={false} />
                <YAxis fontSize={12} tickLine={false} axisLine={false} />
                <Tooltip
                  contentStyle={tooltipStyle}
                  cursor={{ fill: 'hsl(var(--muted))', opacity: 0.4 }}
                />
                <Bar dataKey="students" fill="hsl(262, 83%, 58%)" radius={[4, 4, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
