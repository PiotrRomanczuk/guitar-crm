'use client';

import { useQuery } from '@tanstack/react-query';
import { apiClient } from '@/lib/api-client';

export interface LessonStatsFilters {
  userId?: string;
  dateFrom?: string;
  dateTo?: string;
}

export interface MonthlyStats {
  month: string; // YYYY-MM format
  count: number;
}

export interface LessonStatsResponse {
  total: number;
  byStatus: Record<string, number>;
  monthly: MonthlyStats[];
  lessonsWithSongs: number;
  avgLessonsPerStudent: number;
  upcoming: number;
  completedThisMonth: number;
  dateRange: {
    from: string | null;
    to: string | null;
  };
}

/**
 * Hook to fetch lesson statistics with optional filters
 * Uses React Query for caching and automatic refetching
 */
export function useLessonStats(filters?: LessonStatsFilters) {
  const params = new URLSearchParams();

  if (filters?.userId) params.append('userId', filters.userId);
  if (filters?.dateFrom) params.append('dateFrom', filters.dateFrom);
  if (filters?.dateTo) params.append('dateTo', filters.dateTo);

  const queryString = params.toString();

  return useQuery<LessonStatsResponse>({
    queryKey: ['lessons', 'stats', filters],
    queryFn: async () => {
      const url = queryString ? `/api/lessons/stats?${queryString}` : '/api/lessons/stats';
      return apiClient.get<LessonStatsResponse>(url);
    },
    enabled: true, // Always enabled, filters are optional
    staleTime: 5 * 60 * 1000, // Consider data fresh for 5 minutes
    refetchOnWindowFocus: false, // Don't refetch on window focus for stats
  });
}
