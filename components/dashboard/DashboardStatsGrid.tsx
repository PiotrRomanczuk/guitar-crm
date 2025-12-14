'use client';

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Skeleton } from '@/components/ui/skeleton';
import {
  useDashboardStats,
  AdminStats,
  TeacherStats,
  StudentStats,
} from '@/hooks/useDashboardStats';
import { Users, BookOpen, Music, GraduationCap, TrendingUp, Award } from 'lucide-react';
import { StatsCard } from './StatsCard';

export function DashboardStatsGrid() {
  const { data, isLoading, error } = useDashboardStats();

  if (error) {
    return (
      <Card className="border-destructive/50">
        <CardHeader>
          <CardTitle className="text-destructive">Error loading statistics</CardTitle>
          <CardDescription>
            {error instanceof Error ? error.message : 'Failed to load dashboard statistics'}
          </CardDescription>
        </CardHeader>
      </Card>
    );
  }

  // Admin stats
  if (data?.role === 'admin') {
    const stats = data.stats as AdminStats;
    return (
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        <StatsCard
          title="Total Users"
          value={stats.totalUsers}
          description="All registered users"
          icon={Users}
          isLoading={isLoading}
        />
        <StatsCard
          title="Teachers"
          value={stats.totalTeachers}
          description="Active teachers"
          icon={GraduationCap}
          isLoading={isLoading}
        />
        <StatsCard
          title="Students"
          value={stats.totalStudents}
          description="Enrolled students"
          icon={Users}
          isLoading={isLoading}
        />
        <StatsCard
          title="Song Library"
          value={stats.totalSongs}
          description="Available songs"
          icon={Music}
          isLoading={isLoading}
        />
      </div>
    );
  }

  // Teacher stats
  if (data?.role === 'teacher') {
    const stats = data.stats as TeacherStats;
    return (
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        <StatsCard
          title="My Students"
          value={stats.myStudents}
          description="Students you teach"
          icon={Users}
          isLoading={isLoading}
        />
        <StatsCard
          title="Active Lessons"
          value={stats.activeLessons}
          description="In progress"
          icon={BookOpen}
          isLoading={isLoading}
        />
        <StatsCard
          title="Song Library"
          value={stats.songsLibrary}
          description="Available songs"
          icon={Music}
          isLoading={isLoading}
        />
        <StatsCard
          title="Avg Progress"
          value={`${stats.studentProgress}%`}
          description="Student progress"
          icon={TrendingUp}
          isLoading={isLoading}
        />
      </div>
    );
  }

  // Student stats
  if (data?.role === 'student') {
    const stats = data.stats as StudentStats;
    return (
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        <StatsCard
          title="Teachers"
          value={stats.myTeacher}
          description="Your teachers"
          icon={GraduationCap}
          isLoading={isLoading}
        />
        <StatsCard
          title="Lessons Completed"
          value={stats.lessonsDone}
          description="Total lessons"
          icon={BookOpen}
          isLoading={isLoading}
        />
        <StatsCard
          title="Songs Learning"
          value={stats.songsLearning}
          description="Current repertoire"
          icon={Music}
          isLoading={isLoading}
        />
        <StatsCard
          title="Progress"
          value={`${stats.progress}%`}
          description="Overall progress"
          icon={Award}
          isLoading={isLoading}
        />
      </div>
    );
  }

  // Loading or no role
  return (
    <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
      <Skeleton className="h-32" />
      <Skeleton className="h-32" />
      <Skeleton className="h-32" />
      <Skeleton className="h-32" />
    </div>
  );
}
