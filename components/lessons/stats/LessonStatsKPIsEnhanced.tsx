'use client';

import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { BookOpen, Users, TrendingUp, CheckCircle, XCircle, Clock, BarChart3 } from 'lucide-react';
import * as ss from 'simple-statistics';
import type { AdvancedLessonStats } from '../hooks/useLessonStatsAdvanced';

interface Props {
  overview: AdvancedLessonStats['overview'];
  monthlyTrend: AdvancedLessonStats['monthlyTrend'];
}

export function LessonStatsKPIsEnhanced({ overview, monthlyTrend }: Props) {
  // Calculate statistical metrics
  const monthlyTotals = monthlyTrend.map((m) => m.total);
  const stdDevLessons = monthlyTotals.length > 1 ? ss.standardDeviation(monthlyTotals) : 0;
  const coefficientOfVariation =
    monthlyTotals.length > 1 && ss.mean(monthlyTotals) > 0
      ? (stdDevLessons / ss.mean(monthlyTotals)) * 100
      : 0;

  const kpis = [
    {
      title: 'Total Lessons',
      value: overview.totalLessons.toLocaleString(),
      icon: BookOpen,
      color: 'text-blue-500',
      subtitle: monthlyTotals.length > 1 ? `σ = ${stdDevLessons.toFixed(1)}` : undefined,
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
    {
      title: 'Consistency',
      value: `${(100 - coefficientOfVariation).toFixed(0)}%`,
      icon: BarChart3,
      color: 'text-indigo-500',
      subtitle: coefficientOfVariation > 0 ? `CV = ${coefficientOfVariation.toFixed(1)}%` : undefined,
    },
  ];

  return (
    <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-7 gap-4">
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
            {kpi.subtitle && (
              <div className="text-xs text-muted-foreground mt-1">{kpi.subtitle}</div>
            )}
          </CardContent>
        </Card>
      ))}
    </div>
  );
}
