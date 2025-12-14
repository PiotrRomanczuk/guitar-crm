import { useEffect, useState } from 'react';
import type { Assignment } from './useAssignment';

interface AssignmentListFilters {
  search?: string;
  status?: string;
  startDate?: string;
  endDate?: string;
  student_id?: string;
}

/**
 * Build URL search params from filters
 */
function buildSearchParams(filters?: AssignmentListFilters): URLSearchParams {
  const params = new URLSearchParams();
  if (filters?.search) params.append('search', filters.search);
  if (filters?.status) params.append('status', filters.status);
  if (filters?.startDate) params.append('startDate', filters.startDate);
  if (filters?.endDate) params.append('endDate', filters.endDate);
  if (filters?.student_id) params.append('student_id', filters.student_id);
  return params;
}

/**
 * Hook to fetch list of assignments with filters
 */
export function useAssignmentList(filters?: AssignmentListFilters) {
  const [assignments, setAssignments] = useState<Assignment[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchAssignments = async () => {
      setIsLoading(true);
      setError(null);

      try {
        const params = buildSearchParams(filters);
        const response = await fetch(`/api/assignments?${params}`);

        if (!response.ok) {
          const data = await response.json();
          throw new Error(data.error || 'Failed to fetch assignments');
        }

        const data = await response.json();
        setAssignments(data);
      } catch (err) {
        setError(err instanceof Error ? err.message : 'An error occurred');
        setAssignments([]);
      } finally {
        setIsLoading(false);
      }
    };

    fetchAssignments();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [filters?.search, filters?.status, filters?.startDate, filters?.endDate, filters?.student_id]);

  const refresh = async () => {
    setIsLoading(true);
    setError(null);

    try {
      const params = buildSearchParams(filters);
      const response = await fetch(`/api/assignments?${params}`);

      if (!response.ok) {
        const data = await response.json();
        throw new Error(data.error || 'Failed to fetch assignments');
      }

      const data = await response.json();
      setAssignments(data);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'An error occurred');
      setAssignments([]);
    } finally {
      setIsLoading(false);
    }
  };

  return {
    assignments,
    isLoading,
    error,
    refresh,
  };
}
