'use client';

import React from 'react';
import { useSearchParams } from 'next/navigation';
import { AlertCircle, CheckCircle2 } from 'lucide-react';
import useLessonList from './useLessonList';
import LessonListHeader from './LessonList.Header';
import LessonTable from './LessonTable';
import LessonListFilter from './LessonList.Filter';
import { LessonWithProfiles } from '@/schemas/LessonSchema';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
import { Skeleton } from '@/components/ui/skeleton';
import { useProfiles } from './useProfiles';

interface LessonListProps {
  initialLessons?: LessonWithProfiles[];
  initialError?: string | null;
  role?: 'admin' | 'teacher' | 'student';
}

export default function LessonList({
  initialLessons = [],
  initialError = null,
  role = 'admin',
}: LessonListProps) {
  const searchParams = useSearchParams();
  const {
    lessons,
    loading,
    error,
    filterStatus,
    setFilterStatus,
    filterStudentId,
    setFilterStudentId,
  } = useLessonList(initialLessons, initialError);

  const { students } = useProfiles();

  // Check if we should show success message
  const showSuccess = searchParams.get('created') === 'true';

  if (loading) {
    return (
      <div className="space-y-6">
        <div className="flex justify-between items-center">
          <Skeleton className="h-8 w-32" />
          <Skeleton className="h-10 w-24" />
        </div>
        <div className="space-y-4">
          <Skeleton className="h-12 w-full" />
          <Skeleton className="h-12 w-full" />
          <Skeleton className="h-12 w-full" />
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <Alert variant="destructive">
        <AlertCircle className="h-4 w-4" />
        <AlertTitle>Error</AlertTitle>
        <AlertDescription>{error}</AlertDescription>
      </Alert>
    );
  }

  return (
    <div className="space-y-6">
      {showSuccess && (
        <Alert className="border-green-200 bg-green-50 text-green-800 dark:border-green-900 dark:bg-green-900/20 dark:text-green-300">
          <CheckCircle2 className="h-4 w-4 text-green-600 dark:text-green-400" />
          <AlertTitle>Success</AlertTitle>
          <AlertDescription>Lesson created successfully!</AlertDescription>
        </Alert>
      )}

      <LessonListHeader role={role} />

      <LessonListFilter
        filterStatus={filterStatus}
        onFilterChange={setFilterStatus}
        filterStudentId={filterStudentId}
        onStudentFilterChange={setFilterStudentId}
        students={students}
        showStudentFilter={role === 'admin' || role === 'teacher'}
      />

      <LessonTable lessons={lessons} role={role} baseUrl="/dashboard/lessons" />
    </div>
  );
}
