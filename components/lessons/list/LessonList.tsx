'use client';

import React from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useSearchParams } from 'next/navigation';
import { AlertCircle, CheckCircle2 } from 'lucide-react';
import useLessonList from '../hooks/useLessonList';
import LessonListHeader from './LessonList.Header';
import LessonTable from './LessonTable';
import LessonListFilter from './LessonList.Filter';
import { LessonWithProfiles } from '@/schemas/LessonSchema';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
import { Skeleton } from '@/components/ui/skeleton';
import { useProfiles } from '../hooks/useProfiles';
import { staggerContainer, listItem } from '@/lib/animations';

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
  const { lessons, loading, error } = useLessonList(initialLessons, initialError);

  const { students } = useProfiles();

  // Check if we should show success message
  const showSuccess = searchParams.get('created') === 'true';

  if (loading) {
    return (
      <motion.div
        variants={staggerContainer}
        initial="hidden"
        animate="visible"
        className="space-y-6"
      >
        <div className="flex justify-between items-center">
          <motion.div variants={listItem}>
            <Skeleton className="h-8 w-32" />
          </motion.div>
          <motion.div variants={listItem}>
            <Skeleton className="h-10 w-24" />
          </motion.div>
        </div>
        <div className="space-y-4">
          {[1, 2, 3].map((i) => (
            <motion.div
              key={i}
              variants={listItem}
              animate={{ opacity: [0.5, 1, 0.5] }}
              transition={{ duration: 1.5, repeat: Infinity, delay: i * 0.2 }}
            >
              <Skeleton className="h-12 w-full" />
            </motion.div>
          ))}
        </div>
      </motion.div>
    );
  }

  if (error) {
    return (
      <motion.div
        initial={{ opacity: 0, scale: 0.95 }}
        animate={{ opacity: 1, scale: 1 }}
      >
        <Alert variant="destructive">
          <AlertCircle className="h-4 w-4" />
          <AlertTitle>Error</AlertTitle>
          <AlertDescription>{error}</AlertDescription>
        </Alert>
      </motion.div>
    );
  }

  return (
    <motion.div
      variants={staggerContainer}
      initial="hidden"
      animate="visible"
      className="space-y-6"
    >
      <AnimatePresence>
        {showSuccess && (
          <motion.div
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20 }}
          >
            <Alert className="border-green-200 bg-green-50 text-green-800 dark:border-green-900 dark:bg-green-900/20 dark:text-green-300">
              <CheckCircle2 className="h-4 w-4 text-green-600 dark:text-green-400" />
              <AlertTitle>Success</AlertTitle>
              <AlertDescription>Lesson created successfully!</AlertDescription>
            </Alert>
          </motion.div>
        )}
      </AnimatePresence>

      <motion.div variants={listItem}>
        <LessonListHeader role={role} />
      </motion.div>

      <motion.div variants={listItem}>
        <LessonListFilter
          students={students}
          showStudentFilter={role === 'admin' || role === 'teacher'}
        />
      </motion.div>

      <motion.div variants={listItem}>
        <LessonTable lessons={lessons} role={role} baseUrl="/dashboard/lessons" />
      </motion.div>
    </motion.div>
  );
}
