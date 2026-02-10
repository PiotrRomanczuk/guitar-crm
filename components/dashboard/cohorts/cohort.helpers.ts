import type { CohortDimension, CohortMetric } from '@/lib/services/cohort-analytics';

/**
 * Get human-readable label for dimension
 */
export function getDimensionLabel(dimension: CohortDimension): string {
  const labels: Record<CohortDimension, string> = {
    enrollment_period: 'Enrollment Period',
    status: 'Student Status',
    teacher: 'Teacher',
    lesson_frequency: 'Lesson Frequency',
  };
  return labels[dimension];
}

/**
 * Get human-readable label for metric
 */
export function getMetricLabel(metric: CohortMetric): string {
  const labels: Record<CohortMetric, string> = {
    lessons_completed: 'Lessons Completed',
    mastery_rate: 'Mastery Rate (%)',
    completion_rate: 'Completion Rate (%)',
    retention_rate: 'Retention Rate (%)',
    avg_time_to_master: 'Avg Time to Master (days)',
  };
  return labels[metric];
}

/**
 * Format metric value for display
 */
export function formatMetricValue(metric: CohortMetric, value: number): string {
  switch (metric) {
    case 'lessons_completed':
      return value.toLocaleString();
    case 'mastery_rate':
    case 'completion_rate':
    case 'retention_rate':
      return `${value.toFixed(1)}%`;
    case 'avg_time_to_master':
      return `${value.toFixed(1)} days`;
    default:
      return value.toString();
  }
}

/**
 * Get color for cohort (cycling through palette)
 */
export function getCohortColor(index: number): string {
  const colors = [
    'hsl(var(--primary))',
    'hsl(var(--chart-1))',
    'hsl(var(--chart-2))',
    'hsl(var(--chart-3))',
    'hsl(var(--chart-4))',
    'hsl(var(--chart-5))',
  ];
  return colors[index % colors.length];
}

/**
 * Get description for dimension
 */
export function getDimensionDescription(dimension: CohortDimension): string {
  const descriptions: Record<CohortDimension, string> = {
    enrollment_period: 'Compare students by when they enrolled (quarterly)',
    status: 'Compare students by their current status (active, churned, etc.)',
    teacher: 'Compare students by their primary teacher',
    lesson_frequency: 'Compare students by how often they take lessons',
  };
  return descriptions[dimension];
}

/**
 * Get description for metric
 */
export function getMetricDescription(metric: CohortMetric): string {
  const descriptions: Record<CohortMetric, string> = {
    lessons_completed: 'Total number of completed lessons',
    mastery_rate: 'Percentage of assigned songs that have been mastered',
    completion_rate: 'Percentage of scheduled lessons that were completed',
    retention_rate: 'Percentage of students who are still active',
    avg_time_to_master: 'Average days from song assignment to mastery',
  };
  return descriptions[metric];
}
