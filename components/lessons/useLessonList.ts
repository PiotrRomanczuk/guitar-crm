'use client';

import { useState, useEffect, useCallback } from 'react';
import { useQuery } from '@tanstack/react-query';
import { apiClient } from '@/lib/api-client';
import { LessonWithProfiles } from '@/schemas/LessonSchema';
import { useRouter, usePathname, useSearchParams } from 'next/navigation';

export default function useLessonList(
  initialLessons: LessonWithProfiles[] = [],
  initialError: string | null = null
) {
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();

  // Initialize state from URL params
  const [filterStatus, setFilterStatusState] = useState<string>(
    searchParams.get('filter') || 'all'
  );
  const [filterStudentId, setFilterStudentIdState] = useState<string>(
    searchParams.get('studentId') || 'all'
  );

  // Update URL helper
  const updateUrl = useCallback(
    (key: string, value: string) => {
      const params = new URLSearchParams(searchParams.toString());
      if (value && value !== 'all') {
        params.set(key, value);
      } else {
        params.delete(key);
      }
      router.push(`${pathname}?${params.toString()}`);
    },
    [pathname, router, searchParams]
  );

  // Wrappers for state setters that also update URL
  const setFilterStatus = (status: string) => {
    setFilterStatusState(status);
    updateUrl('filter', status);
  };

  const setFilterStudentId = (studentId: string) => {
    setFilterStudentIdState(studentId);
    updateUrl('studentId', studentId);
  };

  // Sync state with URL params if they change externally (e.g. back button)
  useEffect(() => {
    const status = searchParams.get('filter') || 'all';
    const studentId = searchParams.get('studentId') || 'all';
    setFilterStatusState(status);
    setFilterStudentIdState(studentId);
  }, [searchParams]);

  const {
    data: lessons = initialLessons,
    isLoading,
    error,
    refetch,
  } = useQuery({
    queryKey: ['lessons', filterStatus, filterStudentId],
    queryFn: async () => {
      const params = new URLSearchParams();
      if (filterStatus !== 'all') {
        params.append('filter', filterStatus);
      }
      if (filterStudentId !== 'all') {
        params.append('studentId', filterStudentId);
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
    filterStudentId,
    setFilterStudentId,
    refresh: refetch,
  };
}
