'use client';

import { Loader2 } from 'lucide-react';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { useLessonStatsAdvanced } from '../hooks/useLessonStatsAdvanced';
import { LessonStatsKPIs } from './LessonStatsKPIs';
import { LessonStatsMonthlyChart } from './LessonStatsMonthlyChart';
import { LessonStatsScheduleCharts } from './LessonStatsScheduleCharts';
import { LessonStatsStudentTable } from './LessonStatsStudentTable';
import { LessonStatsGrowthChart } from './LessonStatsGrowthChart';
import { LessonStatsRetention } from './LessonStatsRetention';
import { LessonStatsKPIsEnhanced } from './LessonStatsKPIsEnhanced';
import { LessonStatsMonthlyChartNivo } from './LessonStatsMonthlyChartNivo';
import { LessonStatsScheduleChartsNivo } from './LessonStatsScheduleChartsNivo';
import { LessonStatsGrowthChartNivo } from './LessonStatsGrowthChartNivo';
import { LessonStatsRetentionNivo } from './LessonStatsRetentionNivo';
import { LessonStatsCalendarHeatmap } from './LessonStatsCalendarHeatmap';

export function LessonStatsPageEnhanced() {
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
    <Tabs defaultValue="enhanced" className="space-y-6">
      <TabsList>
        <TabsTrigger value="enhanced">Enhanced (Nivo + Stats)</TabsTrigger>
        <TabsTrigger value="original">Original (Recharts)</TabsTrigger>
      </TabsList>

      <TabsContent value="enhanced" className="space-y-6">
        <LessonStatsKPIsEnhanced overview={data.overview} monthlyTrend={data.monthlyTrend} />
        <LessonStatsMonthlyChartNivo data={data.monthlyTrend} />
        <LessonStatsGrowthChartNivo data={data.studentGrowth} />
        <LessonStatsCalendarHeatmap />
        <LessonStatsScheduleChartsNivo distribution={data.scheduleDistribution} />
        <LessonStatsRetentionNivo retention={data.retention} />
        <LessonStatsStudentTable students={data.studentLeaderboard} />
      </TabsContent>

      <TabsContent value="original" className="space-y-6">
        <LessonStatsKPIs overview={data.overview} />
        <LessonStatsMonthlyChart data={data.monthlyTrend} />
        <LessonStatsScheduleCharts distribution={data.scheduleDistribution} />
        <LessonStatsGrowthChart data={data.studentGrowth} />
        <LessonStatsStudentTable students={data.studentLeaderboard} />
        <LessonStatsRetention retention={data.retention} />
      </TabsContent>
    </Tabs>
  );
}
