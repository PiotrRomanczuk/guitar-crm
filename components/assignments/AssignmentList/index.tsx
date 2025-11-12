'use client';

import { useState } from 'react';
import { Header } from './Header';
import { Table } from './Table';
import { Empty } from './Empty';
import { useAssignmentList } from '../hooks';

interface AssignmentListProps {
  canCreate?: boolean;
}

/**
 * Main Assignment List component
 * Displays list of assignments with filtering and actions
 */
export default function AssignmentList({ canCreate = false }: AssignmentListProps) {
  const [filters] = useState({});
  const { assignments, isLoading, error } = useAssignmentList(filters);

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
