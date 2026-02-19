import { useQuery } from '@tanstack/react-query';
import type {
  TeacherPerformanceMetrics,
  TeacherLessonTrend,
} from '@/lib/services/teacher-performance';

interface TeacherPerformanceResponse {
  metrics: TeacherPerformanceMetrics;
  trends: TeacherLessonTrend[];
}

/**
 * Fetch teacher performance data from API
 */
async function fetchTeacherPerformance(teacherId?: string): Promise<TeacherPerformanceResponse> {
  const url = teacherId
    ? `/api/teachers/performance?teacherId=${teacherId}`
    : '/api/teachers/performance';

  const res = await fetch(url);

  if (!res.ok) {
    throw new Error('Failed to fetch teacher performance');
  }

  return res.json();
}

/**
 * React Query hook for teacher performance metrics and trends
 * @param teacherId - Optional teacher ID (for admin viewing other teachers)
 */
export function useTeacherPerformance(teacherId?: string) {
  return useQuery({
    queryKey: ['teacher-performance', teacherId],
    queryFn: () => fetchTeacherPerformance(teacherId),
    staleTime: 5 * 60 * 1000, // 5 minutes
  });
}
