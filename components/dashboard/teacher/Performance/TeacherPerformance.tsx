'use client';

import { Loader2, AlertCircle } from 'lucide-react';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
import { useTeacherPerformance } from './useTeacherPerformance';
import { MetricsGrid } from './TeacherPerformance.MetricsGrid';
import { Charts } from './TeacherPerformance.Charts';
import type { TeacherPerformanceMetrics } from '@/lib/services/teacher-performance';

interface TeacherPerformanceProps {
  teacherId?: string;
}

// Empty metrics for loading state
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
  const { data, isLoading, error } = useTeacherPerformance(teacherId);

  if (error) {
    return (
      <Alert variant="destructive">
        <AlertCircle className="h-4 w-4" />
        <AlertTitle>Error</AlertTitle>
        <AlertDescription>Failed to load performance metrics. Please try again later.</AlertDescription>
      </Alert>
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
