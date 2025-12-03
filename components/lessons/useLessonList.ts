'use client';

import { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { apiClient } from '@/lib/api-client';
import { LessonWithProfiles } from '@/schemas/LessonSchema';

export default function useLessonList(
  initialLessons: LessonWithProfiles[] = [],
  initialError: string | null = null
) {
  const [filterStatus, setFilterStatus] = useState<string>('all');

  const {
    data: lessons = initialLessons,
    isLoading,
    error,
    refetch,
  } = useQuery({
    queryKey: ['lessons', filterStatus],
    queryFn: async () => {
      const params = new URLSearchParams();
      if (filterStatus !== 'all') {
        params.append('status', filterStatus);
      }

      const response = await apiClient.get<{ lessons: LessonWithProfiles[] }>(
        `/api/lessons?${params.toString()}`
      );
      return response.lessons || [];
    },
    initialData: initialLessons.length > 0 ? initialLessons : undefined,
  });

  return {
    lessons,
    loading: isLoading,
    error: error ? (error instanceof Error ? error.message : 'An error occurred') : initialError,
    filterStatus,
    setFilterStatus,
    refresh: refetch,
  };
}
