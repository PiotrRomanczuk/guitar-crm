/**
 * Teacher Performance Service
 * Pure functions for calculating teacher performance metrics
 */

export interface TeacherPerformanceMetrics {
  teacher_id: string;
  teacher_name: string;
  teacher_email: string;
  active_students: number;
  churned_students: number;
  total_students: number;
  lessons_completed: number;
  lessons_scheduled: number;
  lessons_cancelled: number;
  total_lessons: number;
  avg_lessons_per_student: number;
  lesson_completion_rate: number;
  lesson_cancellation_rate: number;
  songs_mastered: number;
  songs_assigned: number;
  song_mastery_rate: number;
  retention_rate: number;
  refreshed_at: string;
}

export interface TeacherLessonTrend {
  month: string;
  completed: number;
  cancelled: number;
  scheduled: number;
  total: number;
}

/**
 * Calculate lesson completion rate
 * Formula: completed / (completed + scheduled) * 100
 */
export function calculateCompletionRate(
  completed: number,
  scheduled: number
): number {
  const total = completed + scheduled;
  if (total === 0) return 0;
  return Math.round((completed / total) * 100 * 10) / 10; // Round to 1 decimal
}

/**
 * Calculate cancellation rate
 * Formula: cancelled / total * 100
 */
export function calculateCancellationRate(
  cancelled: number,
  total: number
): number {
  if (total === 0) return 0;
  return Math.round((cancelled / total) * 100 * 10) / 10;
}

/**
 * Calculate retention rate
 * Formula: active / (active + churned) * 100
 */
export function calculateRetentionRate(
  active: number,
  churned: number
): number {
  const total = active + churned;
  if (total === 0) return 0;
  return Math.round((active / total) * 100 * 10) / 10;
}

/**
 * Calculate song mastery rate
 * Formula: mastered / assigned * 100
 */
export function calculateMasteryRate(
  mastered: number,
  assigned: number
): number {
  if (assigned === 0) return 0;
  return Math.round((mastered / assigned) * 100 * 10) / 10;
}

/**
 * Calculate average lessons per student
 */
export function calculateAvgLessonsPerStudent(
  totalLessons: number,
  totalStudents: number
): number {
  if (totalStudents === 0) return 0;
  return Math.round((totalLessons / totalStudents) * 10) / 10;
}

/**
 * Format metrics for display (handles null values from database)
 */
export function formatTeacherMetrics(
  rawMetrics: Partial<TeacherPerformanceMetrics>
): TeacherPerformanceMetrics {
  return {
    teacher_id: rawMetrics.teacher_id ?? '',
    teacher_name: rawMetrics.teacher_name ?? '',
    teacher_email: rawMetrics.teacher_email ?? '',
    active_students: rawMetrics.active_students ?? 0,
    churned_students: rawMetrics.churned_students ?? 0,
    total_students: rawMetrics.total_students ?? 0,
    lessons_completed: rawMetrics.lessons_completed ?? 0,
    lessons_scheduled: rawMetrics.lessons_scheduled ?? 0,
    lessons_cancelled: rawMetrics.lessons_cancelled ?? 0,
    total_lessons: rawMetrics.total_lessons ?? 0,
    avg_lessons_per_student: rawMetrics.avg_lessons_per_student ?? 0,
    lesson_completion_rate: rawMetrics.lesson_completion_rate ?? 0,
    lesson_cancellation_rate: rawMetrics.lesson_cancellation_rate ?? 0,
    songs_mastered: rawMetrics.songs_mastered ?? 0,
    songs_assigned: rawMetrics.songs_assigned ?? 0,
    song_mastery_rate: rawMetrics.song_mastery_rate ?? 0,
    retention_rate: rawMetrics.retention_rate ?? 0,
    refreshed_at: rawMetrics.refreshed_at ?? new Date().toISOString(),
  };
}

/**
 * Generate 12-month trend data with missing months filled in
 */
export function generate12MonthTrends(
  trends: TeacherLessonTrend[]
): TeacherLessonTrend[] {
  const result: TeacherLessonTrend[] = [];
  const now = new Date();

  // Generate last 12 months (using UTC to avoid timezone issues)
  for (let i = 11; i >= 0; i--) {
    const targetMonth = now.getMonth() - i;
    const targetYear = now.getFullYear() + Math.floor(targetMonth / 12);
    const normalizedMonth = ((targetMonth % 12) + 12) % 12;

    const month = new Date(Date.UTC(targetYear, normalizedMonth, 1));
    const monthKey = month.toISOString().slice(0, 7); // YYYY-MM

    const existingTrend = trends.find((t) => t.month.startsWith(monthKey));

    result.push({
      month: monthKey,
      completed: existingTrend?.completed ?? 0,
      cancelled: existingTrend?.cancelled ?? 0,
      scheduled: existingTrend?.scheduled ?? 0,
      total: existingTrend?.total ?? 0,
    });
  }

  return result;
}
