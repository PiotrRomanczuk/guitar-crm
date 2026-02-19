import { useQuery } from '@tanstack/react-query';
import type {
  CohortDimension,
  CohortMetric,
  CohortAnalyticsResult,
} from '@/lib/services/cohort-analytics';

interface UseCohortAnalyticsParams {
  dimension: CohortDimension;
  metric: CohortMetric;
  startDate?: Date;
  endDate?: Date;
  enabled?: boolean;
}

/**
 * Fetch cohort analytics from API
 */
async function fetchCohortAnalytics(
  dimension: CohortDimension,
  metric: CohortMetric,
  startDate?: Date,
  endDate?: Date
): Promise<CohortAnalyticsResult> {
  const params = new URLSearchParams({
    dimension,
    metric,
  });

  if (startDate) {
    params.append('startDate', startDate.toISOString());
  }
  if (endDate) {
    params.append('endDate', endDate.toISOString());
  }

  const res = await fetch(`/api/cohorts/analytics?${params.toString()}`);

  if (!res.ok) {
    throw new Error('Failed to fetch cohort analytics');
  }

  return res.json();
}

/**
 * React Query hook for cohort analytics
 */
export function useCohortAnalytics({
  dimension,
  metric,
  startDate,
  endDate,
  enabled = true,
}: UseCohortAnalyticsParams) {
  return useQuery({
    queryKey: ['cohort-analytics', dimension, metric, startDate, endDate],
    queryFn: () => fetchCohortAnalytics(dimension, metric, startDate, endDate),
    staleTime: 5 * 60 * 1000, // 5 minutes
    enabled,
  });
}
