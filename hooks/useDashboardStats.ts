'use client';

import { useQuery } from '@tanstack/react-query';
import { apiClient } from '@/lib/api-client';

export interface AdminStats {
  totalUsers: number;
  totalTeachers: number;
  totalStudents: number;
  totalSongs: number;
  totalLessons: number;
}

export interface TeacherStats {
  myStudents: number;
  activeLessons: number;
  songsLibrary: number;
  studentProgress: number;
}

export interface StudentStats {
  myTeacher: number;
  lessonsDone: number;
  songsLearning: number;
  progress: number;
}

export interface DashboardStatsResponse {
  role: 'admin' | 'teacher' | 'student' | 'user';
  stats: AdminStats | TeacherStats | StudentStats | Record<string, never>;
}

/**
 * Hook to fetch dashboard statistics based on user role
 * Uses React Query for caching and automatic refetching
 */
export function useDashboardStats() {
  return useQuery<DashboardStatsResponse>({
    queryKey: ['dashboard', 'stats'],
    queryFn: async () => {
      return apiClient.get<DashboardStatsResponse>('/api/dashboard/stats');
    },
    staleTime: 5 * 60 * 1000, // Consider data fresh for 5 minutes
    refetchOnWindowFocus: true,
    refetchOnMount: true,
  });
}
