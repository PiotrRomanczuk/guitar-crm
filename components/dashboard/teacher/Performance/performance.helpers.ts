/**
 * Format percentage for display
 */
export function formatPercentage(value: number): string {
  return `${value.toFixed(1)}%`;
}

/**
 * Format number for display
 */
export function formatNumber(value: number): string {
  return value.toLocaleString();
}

/**
 * Format month for chart display (e.g., "2026-02" -> "Feb 26")
 */
export function formatMonthForChart(monthString: string): string {
  const date = new Date(`${monthString}-01`);
  return date.toLocaleDateString('en-US', { month: 'short', year: '2-digit' });
}

/**
 * Determine if a metric is positive (higher is better)
 */
export function isPositiveMetric(metricName: string): boolean {
  const positiveMetrics = [
    'completion_rate',
    'mastery_rate',
    'retention_rate',
    'active_students',
    'total_students',
    'lessons_completed',
    'songs_mastered',
    'avg_lessons_per_student',
  ];

  return positiveMetrics.includes(metricName);
}

/**
 * Get color class for metric based on value and threshold
 */
export function getMetricColor(
  value: number,
  goodThreshold: number,
  warningThreshold: number
): 'success' | 'warning' | 'danger' {
  if (value >= goodThreshold) return 'success';
  if (value >= warningThreshold) return 'warning';
  return 'danger';
}
