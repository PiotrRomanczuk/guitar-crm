'use client';

import React from 'react';
import { useSearchParams } from 'next/navigation';
import useLessonList from './useLessonList';
import LessonListHeader from './LessonList.Header';
import LessonTable from './LessonTable';
import LessonListFilter from './LessonList.Filter';
import { LessonWithProfiles } from '@/schemas/LessonSchema';

interface LessonListProps {
  initialLessons?: LessonWithProfiles[];
  initialError?: string | null;
}

export default function LessonList({ initialLessons = [], initialError = null }: LessonListProps) {
  const searchParams = useSearchParams();
  const { lessons, loading, error, filterStatus, setFilterStatus } = useLessonList(
    initialLessons,
    initialError
  );

  // Check if we should show success message
  const showSuccess = searchParams.get('created') === 'true';

  if (loading) {
    return (
      <div className="text-center py-8 text-gray-600 dark:text-gray-400">Loading lessons...</div>
    );
  }

  if (error) {
    return <div className="text-center py-8 text-red-600 dark:text-red-400">Error: {error}</div>;
  }

  return (
    <div>
      {showSuccess && (
        <div className="mb-4 p-4 bg-green-50 dark:bg-green-900/20 border border-green-200 dark:border-green-800 rounded-lg text-green-700 dark:text-green-400">
          Lesson created successfully!
        </div>
      )}
      <LessonListHeader />
      <LessonListFilter filterStatus={filterStatus} onFilterChange={setFilterStatus} />
      <LessonTable lessons={lessons} role="admin" baseUrl="/dashboard/lessons" />
    </div>
  );
}
