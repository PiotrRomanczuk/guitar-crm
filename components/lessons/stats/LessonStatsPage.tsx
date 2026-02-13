'use client';

import { Loader2 } from 'lucide-react';
import { useLessonStatsAdvanced } from '../hooks/useLessonStatsAdvanced';
import { LessonStatsKPIs } from './LessonStatsKPIs';
import { LessonStatsMonthlyChart } from './LessonStatsMonthlyChart';
import { LessonStatsScheduleCharts } from './LessonStatsScheduleCharts';
import { LessonStatsStudentTable } from './LessonStatsStudentTable';
import { LessonStatsGrowthChart } from './LessonStatsGrowthChart';
import { LessonStatsRetention } from './LessonStatsRetention';

export function LessonStatsPage() {
  const { data, isLoading, error } = useLessonStatsAdvanced();

  if (isLoading) {
    return (
      <div className="flex justify-center p-12">
        <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
      </div>
    );
  }

  if (error || !data) {
    return (
      <div className="text-center p-12 text-muted-foreground">
        Failed to load lesson statistics.
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <LessonStatsKPIs overview={data.overview} />
      <LessonStatsMonthlyChart data={data.monthlyTrend} />
      <LessonStatsScheduleCharts distribution={data.scheduleDistribution} />
      <LessonStatsGrowthChart data={data.studentGrowth} />
      <LessonStatsStudentTable students={data.studentLeaderboard} />
      <LessonStatsRetention retention={data.retention} />
    </div>
  );
}
