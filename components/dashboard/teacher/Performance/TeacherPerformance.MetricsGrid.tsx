'use client';

import { StatsCard } from '@/components/dashboard/StatsCard';
import { Users, TrendingUp, Music, Target, Calendar, Award } from 'lucide-react';
import type { TeacherPerformanceMetrics } from '@/lib/services/teacher-performance';
import { formatPercentage, formatNumber } from './performance.helpers';

interface MetricsGridProps {
  metrics: TeacherPerformanceMetrics;
  isLoading?: boolean;
}

export function MetricsGrid({ metrics, isLoading }: MetricsGridProps) {
  return (
    <div className="grid grid-cols-1 gap-4 md:grid-cols-2 lg:grid-cols-3">
      <StatsCard
        title="Active Students"
        value={formatNumber(metrics.active_students)}
        description={`${metrics.churned_students} churned • ${metrics.total_students} total`}
        icon={Users}
        variant="gradient"
        isLoading={isLoading}
        delay={0}
      />

      <StatsCard
        title="Lesson Completion Rate"
        value={formatPercentage(metrics.lesson_completion_rate)}
        description={`${metrics.lessons_completed} completed • ${metrics.lessons_scheduled} scheduled`}
        icon={TrendingUp}
        variant="gradient"
        isLoading={isLoading}
        delay={100}
      />

      <StatsCard
        title="Retention Rate"
        value={formatPercentage(metrics.retention_rate)}
        description="Student retention"
        icon={Target}
        variant="gradient"
        isLoading={isLoading}
        delay={200}
      />

      <StatsCard
        title="Song Mastery Rate"
        value={formatPercentage(metrics.song_mastery_rate)}
        description={`${metrics.songs_mastered} mastered • ${metrics.songs_assigned} assigned`}
        icon={Music}
        variant="gradient"
        isLoading={isLoading}
        delay={300}
      />

      <StatsCard
        title="Avg Lessons/Student"
        value={formatNumber(metrics.avg_lessons_per_student)}
        description="Average lessons per student"
        icon={Calendar}
        variant="gradient"
        isLoading={isLoading}
        delay={400}
      />

      <StatsCard
        title="Cancellation Rate"
        value={formatPercentage(metrics.lesson_cancellation_rate)}
        description={`${metrics.lessons_cancelled} of ${metrics.total_lessons} total`}
        icon={Award}
        variant="gradient"
        isLoading={isLoading}
        delay={500}
      />
    </div>
  );
}
