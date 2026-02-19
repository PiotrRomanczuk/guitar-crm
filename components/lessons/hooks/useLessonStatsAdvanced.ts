import { useQuery } from '@tanstack/react-query';

export interface AdvancedLessonStats {
  overview: {
    totalLessons: number;
    uniqueStudents: number;
    avgLessonsPerWeek: number;
    completionRate: number;
    cancellationRate: number;
    avgRetentionDays: number;
  };
  monthlyTrend: Array<{
    month: string;
    completed: number;
    cancelled: number;
    scheduled: number;
    total: number;
  }>;
  studentLeaderboard: Array<{
    name: string;
    email: string;
    totalLessons: number;
    firstLesson: string;
    lastLesson: string;
    activeSpanMonths: number;
  }>;
  scheduleDistribution: {
    byDayOfWeek: Array<{ day: string; count: number }>;
    byHourOfDay: Array<{ hour: string; count: number }>;
  };
  studentGrowth: Array<{
    month: string;
    newStudents: number;
    cumulativeStudents: number;
  }>;
  retention: {
    avgLifetimeMonths: number;
    activeStudents: number;
    churnedStudents: number;
    lifetimeHistogram: Array<{ bucket: string; count: number }>;
  };
}

async function fetchAdvancedStats(): Promise<AdvancedLessonStats> {
  const res = await fetch('/api/lessons/stats/advanced');
  if (!res.ok) throw new Error('Failed to fetch advanced lesson stats');
  return res.json();
}

export function useLessonStatsAdvanced() {
  return useQuery<AdvancedLessonStats>({
    queryKey: ['lesson-stats-advanced'],
    queryFn: fetchAdvancedStats,
    staleTime: 5 * 60 * 1000,
  });
}
