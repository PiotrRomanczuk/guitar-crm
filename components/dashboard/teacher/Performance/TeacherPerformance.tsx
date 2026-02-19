'use client';

import { useState } from 'react';
import { Loader2, Info, RefreshCw, X } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { useTeacherPerformance } from './useTeacherPerformance';
import { MetricsGrid } from './TeacherPerformance.MetricsGrid';
import { Charts } from './TeacherPerformance.Charts';
import type { TeacherPerformanceMetrics } from '@/lib/services/teacher-performance';

interface TeacherPerformanceProps {
  teacherId?: string;
}

const emptyMetrics: TeacherPerformanceMetrics = {
  teacher_id: '',
  teacher_name: '',
  teacher_email: '',
  active_students: 0,
  churned_students: 0,
  total_students: 0,
  lessons_completed: 0,
  lessons_scheduled: 0,
  lessons_cancelled: 0,
  total_lessons: 0,
  avg_lessons_per_student: 0,
  lesson_completion_rate: 0,
  lesson_cancellation_rate: 0,
  songs_mastered: 0,
  songs_assigned: 0,
  song_mastery_rate: 0,
  retention_rate: 0,
  refreshed_at: '',
};

export function TeacherPerformance({ teacherId }: TeacherPerformanceProps) {
  const { data, isLoading, error, refetch, isRefetching } = useTeacherPerformance(teacherId);
  const [isDismissed, setIsDismissed] = useState(false);

  if (error) {
    if (isDismissed) return null;

    return (
      <div className="flex items-center gap-3 rounded-lg border border-border bg-muted/50 px-4 py-3 text-sm dark:bg-muted/20">
        <Info className="h-4 w-4 shrink-0 text-muted-foreground" />
        <span className="text-muted-foreground">Performance metrics unavailable</span>
        <Button
          variant="ghost"
          size="sm"
          onClick={() => refetch()}
          disabled={isRefetching}
          className="ml-auto h-7 gap-1.5 text-xs"
        >
          <RefreshCw className={`h-3 w-3 ${isRefetching ? 'animate-spin' : ''}`} />
          Retry
        </Button>
        <button
          onClick={() => setIsDismissed(true)}
          className="text-muted-foreground hover:text-foreground transition-colors"
          aria-label="Dismiss notice"
        >
          <X className="h-4 w-4" />
        </button>
      </div>
    );
  }

  if (isLoading || !data) {
    return (
      <div className="space-y-6">
        <MetricsGrid metrics={emptyMetrics} isLoading={true} />
        <div className="flex justify-center p-12">
          <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
        </div>
      </div>
    );
  }

  const { metrics, trends } = data;

  return (
    <div className="space-y-6">
      <MetricsGrid metrics={metrics} isLoading={false} />
      <Charts trends={trends} />
    </div>
  );
}
