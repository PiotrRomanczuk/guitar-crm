'use client';

import { useQuery } from '@tanstack/react-query';
import { apiClient } from '@/lib/api-client';

interface Profile {
  id: string;
  email: string;
  full_name: string;
  is_student?: boolean;
  is_teacher?: boolean;
}

export function useProfiles() {
  const {
    data: allProfiles = [],
    isLoading,
    error,
  } = useQuery({
    queryKey: ['profiles'],
    queryFn: async () => {
      return apiClient.get<Profile[]>('/api/profiles');
    },
  });

  const students = allProfiles.filter((p) => p.is_student);
  const teachers = allProfiles.filter((p) => p.is_teacher);

  return {
    students,
    teachers,
    loading: isLoading,
    error: error ? (error instanceof Error ? error.message : 'Failed to load users') : null,
  };
}
