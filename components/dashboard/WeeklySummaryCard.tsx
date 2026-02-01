'use client';

import { motion } from 'framer-motion';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Calendar, Users, Music, TrendingUp } from 'lucide-react';
import { useQuery } from '@tanstack/react-query';
import { Skeleton } from '@/components/ui/skeleton';
import { startOfWeek, endOfWeek, format } from 'date-fns';
import { staggerContainer, listItem, cardEntrance } from '@/lib/animations';

interface WeeklySummary {
  lessonsCompleted: number;
  newStudents: number;
  songsAssigned: number;
  weekStart: string;
  weekEnd: string;
}

async function fetchWeeklySummary(): Promise<WeeklySummary> {
  const response = await fetch('/api/stats/weekly');
  if (!response.ok) {
    throw new Error('Failed to fetch weekly summary');
  }
  return response.json();
}

export function WeeklySummaryCard() {
  const { data, isLoading, error } = useQuery({
    queryKey: ['weekly-summary'],
    queryFn: fetchWeeklySummary,
    refetchInterval: 60000, // Refetch every minute
  });

  const weekLabel = data
    ? `${format(new Date(data.weekStart), 'MMM d')} - ${format(
        new Date(data.weekEnd),
        'MMM d, yyyy'
      )}`
    : format(startOfWeek(new Date()), 'MMM d') +
      ' - ' +
      format(endOfWeek(new Date()), 'MMM d, yyyy');

  if (error) {
    return (
      <motion.div variants={cardEntrance} initial="hidden" animate="visible">
        <Card className="border-destructive/50">
          <CardHeader>
            <CardTitle className="text-destructive">Error loading weekly summary</CardTitle>
            <CardDescription>Failed to fetch this week&apos;s statistics</CardDescription>
          </CardHeader>
        </Card>
      </motion.div>
    );
  }

  return (
    <motion.div variants={cardEntrance} initial="hidden" animate="visible">
      <Card>
        <CardHeader className="pb-3 sm:pb-6">
          <CardTitle className="flex items-center gap-2 text-base sm:text-lg">
            <Calendar className="h-4 w-4 sm:h-5 sm:w-5" />
            This Week&apos;s Activity
          </CardTitle>
          <CardDescription className="text-xs sm:text-sm">{weekLabel}</CardDescription>
        </CardHeader>
        <CardContent>
          {isLoading ? (
            <div className="grid grid-cols-3 gap-2 sm:gap-3 lg:gap-4">
              {[1, 2, 3].map((i) => (
                <motion.div
                  key={i}
                  animate={{ opacity: [0.5, 1, 0.5] }}
                  transition={{ duration: 1.5, repeat: Infinity, delay: i * 0.2 }}
                >
                  <Skeleton className="h-16 sm:h-20" />
                </motion.div>
              ))}
            </div>
          ) : (
            <motion.div
              variants={staggerContainer}
              initial="hidden"
              animate="visible"
              className="grid grid-cols-3 gap-2 sm:gap-3 lg:gap-4"
            >
              {/* Lessons Completed */}
              <motion.div
                variants={listItem}
                whileHover={{ scale: 1.05, y: -2 }}
                className="text-center p-2 sm:p-3 rounded-lg bg-blue-50 dark:bg-blue-900/20 border border-blue-100 dark:border-blue-800 cursor-pointer"
              >
                <div className="flex items-center justify-center mb-1 sm:mb-2">
                  <Calendar className="h-4 w-4 sm:h-5 sm:w-5 text-blue-600 dark:text-blue-400" />
                </div>
                <div className="text-lg sm:text-2xl font-bold text-blue-600 dark:text-blue-400">
                  {data?.lessonsCompleted ?? 0}
                </div>
                <div className="text-[10px] sm:text-xs text-muted-foreground mt-0.5 sm:mt-1">
                  Lessons
                </div>
              </motion.div>

              {/* New Students */}
              <motion.div
                variants={listItem}
                whileHover={{ scale: 1.05, y: -2 }}
                className="text-center p-2 sm:p-3 rounded-lg bg-green-50 dark:bg-green-900/20 border border-green-100 dark:border-green-800 cursor-pointer"
              >
                <div className="flex items-center justify-center mb-1 sm:mb-2">
                  <Users className="h-4 w-4 sm:h-5 sm:w-5 text-green-600 dark:text-green-400" />
                </div>
                <div className="text-lg sm:text-2xl font-bold text-green-600 dark:text-green-400">
                  {data?.newStudents ?? 0}
                </div>
                <div className="text-[10px] sm:text-xs text-muted-foreground mt-0.5 sm:mt-1">
                  New Students
                </div>
              </motion.div>

              {/* Songs Assigned */}
              <motion.div
                variants={listItem}
                whileHover={{ scale: 1.05, y: -2 }}
                className="text-center p-2 sm:p-3 rounded-lg bg-purple-50 dark:bg-purple-900/20 border border-purple-100 dark:border-purple-800 cursor-pointer"
              >
                <div className="flex items-center justify-center mb-1 sm:mb-2">
                  <Music className="h-4 w-4 sm:h-5 sm:w-5 text-purple-600 dark:text-purple-400" />
                </div>
                <div className="text-lg sm:text-2xl font-bold text-purple-600 dark:text-purple-400">
                  {data?.songsAssigned ?? 0}
                </div>
                <div className="text-[10px] sm:text-xs text-muted-foreground mt-0.5 sm:mt-1">
                  Songs Added
                </div>
              </motion.div>
            </motion.div>
          )}

          {data && (data.lessonsCompleted > 0 || data.newStudents > 0 || data.songsAssigned > 0) && (
            <motion.div
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.5 }}
              className="mt-4 pt-4 border-t flex items-center justify-center gap-1 text-xs text-muted-foreground"
            >
              <motion.div
                animate={{ scale: [1, 1.2, 1] }}
                transition={{ duration: 1.5, repeat: Infinity }}
              >
                <TrendingUp className="h-3 w-3 text-green-500" />
              </motion.div>
              <span>Great progress this week!</span>
            </motion.div>
          )}
        </CardContent>
      </Card>
    </motion.div>
  );
}
