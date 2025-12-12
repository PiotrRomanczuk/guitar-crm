'use client';

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Skeleton } from '@/components/ui/skeleton';
import { useLessonStats, LessonStatsFilters } from '@/hooks/useLessonStats';
import { BarChart, Calendar, CheckCircle2, Clock } from 'lucide-react';
import { Badge } from '@/components/ui/badge';

interface LessonStatsOverviewProps {
  filters?: LessonStatsFilters;
}

export function LessonStatsOverview({ filters }: LessonStatsOverviewProps) {
  const { data, isLoading, error } = useLessonStats(filters);

  if (error) {
    return (
      <Card className="border-destructive/50">
        <CardHeader>
          <CardTitle className="text-destructive">Error loading lesson statistics</CardTitle>
          <CardDescription>
            {error instanceof Error ? error.message : 'Failed to load lesson statistics'}
          </CardDescription>
        </CardHeader>
      </Card>
    );
  }

  if (isLoading) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>Lesson Statistics</CardTitle>
          <CardDescription>Loading statistics...</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <Skeleton className="h-16 w-full" />
          <Skeleton className="h-16 w-full" />
          <Skeleton className="h-16 w-full" />
        </CardContent>
      </Card>
    );
  }

  if (!data) {
    return null;
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <BarChart className="h-5 w-5" />
          Lesson Statistics
        </CardTitle>
        <CardDescription>
          Overview of lesson activity and progress
          {filters?.dateFrom && filters?.dateTo && (
            <span className="ml-2">
              from {new Date(filters.dateFrom).toLocaleDateString()} to{' '}
              {new Date(filters.dateTo).toLocaleDateString()}
            </span>
          )}
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-6">
        {/* Overview metrics */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          <div className="space-y-1">
            <div className="flex items-center text-sm text-muted-foreground">
              <Calendar className="h-4 w-4 mr-1" />
              Total Lessons
            </div>
            <div className="text-2xl font-bold">{data.total}</div>
          </div>
          <div className="space-y-1">
            <div className="flex items-center text-sm text-muted-foreground">
              <CheckCircle2 className="h-4 w-4 mr-1" />
              This Month
            </div>
            <div className="text-2xl font-bold">{data.completedThisMonth}</div>
          </div>
          <div className="space-y-1">
            <div className="flex items-center text-sm text-muted-foreground">
              <Clock className="h-4 w-4 mr-1" />
              Upcoming
            </div>
            <div className="text-2xl font-bold">{data.upcoming}</div>
          </div>
          <div className="space-y-1">
            <div className="flex items-center text-sm text-muted-foreground">
              With Songs
            </div>
            <div className="text-2xl font-bold">{data.lessonsWithSongs}</div>
          </div>
        </div>

        {/* Status breakdown */}
        <div className="space-y-2">
          <h4 className="text-sm font-medium">By Status</h4>
          <div className="flex flex-wrap gap-2">
            {Object.entries(data.byStatus).map(([status, count]) => (
              <Badge key={status} variant="outline" className="capitalize">
                {status.replace('_', ' ')}: {count}
              </Badge>
            ))}
          </div>
        </div>

        {/* Additional metric */}
        {data.avgLessonsPerStudent > 0 && (
          <div className="pt-4 border-t">
            <div className="text-sm text-muted-foreground">Average lessons per student</div>
            <div className="text-xl font-semibold">{data.avgLessonsPerStudent.toFixed(1)}</div>
          </div>
        )}
      </CardContent>
    </Card>
  );
}
