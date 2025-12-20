'use client';

import { useCallback } from 'react';
import { useRouter, usePathname, useSearchParams } from 'next/navigation';
import { Header } from './Header';
import { Table } from './Table';
import { Empty } from './Empty';
import { Filters } from './Filters';
import { useAssignmentList } from '../hooks';

interface AssignmentListProps {
  canCreate?: boolean;
}

/**
 * Main Assignment List component
 * Displays list of assignments with filtering and actions
 */
export default function AssignmentList({ canCreate = false }: AssignmentListProps) {
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();

  const search = searchParams.get('search') || '';
  const status = searchParams.get('status') || '';
  const studentId = searchParams.get('studentId') || '';

  const { assignments, isLoading, error } = useAssignmentList({
    search,
    status,
    student_id: studentId,
  });

  const createQueryString = useCallback(
    (name: string, value: string) => {
      const params = new URLSearchParams(searchParams.toString());
      if (value) {
        params.set(name, value);
      } else {
        params.delete(name);
      }
      return params.toString();
    },
    [searchParams]
  );

  const handleSearchChange = (value: string) => {
    router.replace(pathname + '?' + createQueryString('search', value));
  };

  const handleStatusChange = (value: string) => {
    router.replace(pathname + '?' + createQueryString('status', value));
  };

  const handleStudentChange = (value: string) => {
    router.replace(pathname + '?' + createQueryString('studentId', value));
  };

  const handleReset = () => {
    router.replace(pathname);
  };

  if (error) {
    return (
      <div
        className="p-4 bg-red-50 dark:bg-red-900/20 border border-red-200 
                      dark:border-red-800 rounded-lg"
      >
        <p className="text-xs sm:text-sm text-red-800 dark:text-red-200">Error: {error}</p>
      </div>
    );
  }

  return (
    <div className="space-y-4 sm:space-y-6">
      <Header canCreate={canCreate} />

      <Filters
        search={search}
        status={status}
        studentId={studentId}
        showStudentFilter={canCreate}
        onSearchChange={handleSearchChange}
        onStatusChange={handleStatusChange}
        onStudentChange={handleStudentChange}
        onReset={handleReset}
      />

      {isLoading ? (
        <div className="flex justify-center items-center py-8 sm:py-12">
          <div
            className="animate-spin rounded-full h-8 w-8 sm:h-12 sm:w-12 
                          border-b-2 border-blue-600 dark:border-blue-400"
          />
        </div>
      ) : assignments.length === 0 ? (
        <Empty />
      ) : (
        <Table assignments={assignments} />
      )}
    </div>
  );
}
