'use client';

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Calendar, Users, Music, TrendingUp } from 'lucide-react';
import { useQuery } from '@tanstack/react-query';
import { Skeleton } from '@/components/ui/skeleton';
import { startOfWeek, endOfWeek, format } from 'date-fns';

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
      <Card className="border-destructive/50">
        <CardHeader>
          <CardTitle className="text-destructive">Error loading weekly summary</CardTitle>
          <CardDescription>Failed to fetch this week&apos;s statistics</CardDescription>
        </CardHeader>
      </Card>
    );
  }

  return (
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
            <Skeleton className="h-16 sm:h-20" />
            <Skeleton className="h-16 sm:h-20" />
            <Skeleton className="h-16 sm:h-20" />
          </div>
        ) : (
          <div className="grid grid-cols-3 gap-2 sm:gap-3 lg:gap-4">
            {/* Lessons Completed */}
            <div className="text-center p-2 sm:p-3 rounded-lg bg-primary/10 border border-primary/20">
              <div className="flex items-center justify-center mb-1 sm:mb-2">
                <Calendar className="h-4 w-4 sm:h-5 sm:w-5 text-primary" />
              </div>
              <div className="text-lg sm:text-2xl font-bold text-primary">
                {data?.lessonsCompleted ?? 0}
              </div>
              <div className="text-[10px] sm:text-xs text-muted-foreground mt-0.5 sm:mt-1">
                Lessons
              </div>
            </div>

            {/* New Students */}
            <div className="text-center p-2 sm:p-3 rounded-lg bg-success/10 border border-success/20">
              <div className="flex items-center justify-center mb-1 sm:mb-2">
                <Users className="h-4 w-4 sm:h-5 sm:w-5 text-success" />
              </div>
              <div className="text-lg sm:text-2xl font-bold text-success">
                {data?.newStudents ?? 0}
              </div>
              <div className="text-[10px] sm:text-xs text-muted-foreground mt-0.5 sm:mt-1">
                New Students
              </div>
            </div>

            {/* Songs Assigned */}
            <div className="text-center p-2 sm:p-3 rounded-lg bg-purple-500/10 border border-purple-500/20">
              <div className="flex items-center justify-center mb-1 sm:mb-2">
                <Music className="h-4 w-4 sm:h-5 sm:w-5 text-purple-600 dark:text-purple-400" />
              </div>
              <div className="text-lg sm:text-2xl font-bold text-purple-600 dark:text-purple-400">
                {data?.songsAssigned ?? 0}
              </div>
              <div className="text-[10px] sm:text-xs text-muted-foreground mt-0.5 sm:mt-1">
                Songs Added
              </div>
            </div>
          </div>
        )}

        {data && (data.lessonsCompleted > 0 || data.newStudents > 0 || data.songsAssigned > 0) && (
          <div className="mt-4 pt-4 border-t flex items-center justify-center gap-1 text-xs text-muted-foreground">
            <TrendingUp className="h-3 w-3 text-success" />
            <span>Great progress this week!</span>
          </div>
        )}
      </CardContent>
    </Card>
  );
}
