'use client';

import { LessonStatsCharts } from '@/components/dashboard/stats/LessonStatsCharts';
import { SongStatsCharts } from '@/components/dashboard/stats/SongStatsCharts';

export function AnalyticsCharts() {
  return (
    <div className="space-y-6">
      <LessonStatsCharts />
      <SongStatsCharts />
    </div>
  );
}
