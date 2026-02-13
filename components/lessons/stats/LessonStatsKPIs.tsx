'use client';

import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { BookOpen, Users, TrendingUp, CheckCircle, XCircle, Clock } from 'lucide-react';
import type { AdvancedLessonStats } from '../hooks/useLessonStatsAdvanced';

interface LessonStatsKPIsProps {
  overview: AdvancedLessonStats['overview'];
}

export function LessonStatsKPIs({ overview }: LessonStatsKPIsProps) {
  const kpis = [
    {
      title: 'Total Lessons',
      value: overview.totalLessons.toLocaleString(),
      icon: BookOpen,
      color: 'text-blue-500',
    },
    {
      title: 'Unique Students',
      value: overview.uniqueStudents.toLocaleString(),
      icon: Users,
      color: 'text-purple-500',
    },
    {
      title: 'Avg / Week',
      value: overview.avgLessonsPerWeek.toFixed(1),
      icon: TrendingUp,
      color: 'text-emerald-500',
    },
    {
      title: 'Completion Rate',
      value: `${overview.completionRate}%`,
      icon: CheckCircle,
      color: 'text-green-500',
    },
    {
      title: 'Cancellation Rate',
      value: `${overview.cancellationRate}%`,
      icon: XCircle,
      color: 'text-red-500',
    },
    {
      title: 'Avg Retention',
      value: `${overview.avgRetentionDays}d`,
      icon: Clock,
      color: 'text-amber-500',
    },
  ];

  return (
    <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-4">
      {kpis.map((kpi) => (
        <Card key={kpi.title}>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">
              {kpi.title}
            </CardTitle>
            <kpi.icon className={`h-4 w-4 ${kpi.color}`} />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{kpi.value}</div>
          </CardContent>
        </Card>
      ))}
    </div>
  );
}
