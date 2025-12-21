'use client';

import { TeacherDashboardData } from '@/app/actions/teacher/dashboard';
import { StudentList } from '@/components/dashboard/teacher/StudentList';
import { StatCard } from '@/components/dashboard/student/StatCard';
import { RecentActivity } from '@/components/dashboard/student/RecentActivity'; // Reusing generic one
import { ProgressChart } from '@/components/dashboard/student/ProgressChart'; // Reusing generic one
import { SongLibrary } from '@/components/dashboard/teacher/SongLibrary';
import { AssignmentList } from '@/components/dashboard/teacher/AssignmentList';
import { LessonStatsOverview } from '@/components/dashboard/LessonStatsOverview';
import { AnalyticsCharts } from '@/components/dashboard/analytics-charts';
import { BearerTokenCard } from '@/components/dashboard/BearerTokenCard';
import { useDashboardStats, AdminStats as DashboardAdminStats } from '@/hooks/useDashboardStats';
import { Users, BookOpen, Music, Shield, FileText } from 'lucide-react';
import Link from 'next/link';
import { Button } from '@/components/ui/button';

interface RecentUser {
  id: string;
  full_name: string | null;
  email: string | null;
  created_at: string;
}

interface AdminStats {
  totalUsers: number;
  totalTeachers: number;
  totalStudents: number;
  totalSongs: number;
  totalLessons: number;
  recentUsers: RecentUser[];
}

interface TeacherDashboardClientProps {
  data: TeacherDashboardData;
  email?: string;
  adminStats?: AdminStats;
  token?: string;
}

export function TeacherDashboardClient({ data, adminStats, token }: TeacherDashboardClientProps) {
  const { data: dashboardData } = useDashboardStats();
  const apiAdminStats =
    dashboardData?.role === 'admin' ? (dashboardData.stats as DashboardAdminStats) : null;

  // Use API stats if available, fallback to prop stats for backwards compatibility
  const displayAdminStats = apiAdminStats || adminStats;

  return (
    <div className="min-h-screen bg-background font-sans">
      <main className="container mx-auto px-4 py-8 max-w-7xl space-y-8">
        <div className="flex flex-col gap-2 opacity-0 animate-fade-in">
          <h1 className="text-3xl font-bold tracking-tight">
            Welcome back,{' '}
            <span className="text-primary">{displayAdminStats ? 'Admin' : 'Coach'}</span>
          </h1>
          <p className="text-muted-foreground">
            Here&apos;s what&apos;s happening with your guitar students today.
          </p>
        </div>

        {/* Lesson Statistics */}
        <LessonStatsOverview />

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          <div className="lg:col-span-2 space-y-8">
            <StudentList students={data.students} />
            <ProgressChart data={data.chartData} />
            <SongLibrary songs={data.songs} />
          </div>
          <div className="space-y-8">
            <RecentActivity activities={data.activities} />
            <AssignmentList assignments={data.assignments} />
          </div>
        </div>

        {/* Admin Section */}
        {displayAdminStats && (
          <div
            className="space-y-6 pt-8 border-t opacity-0 animate-fade-in"
            style={{ animationDelay: '300ms', animationFillMode: 'forwards' }}
          >
            <div className="flex flex-col gap-2">
              <h2 className="text-2xl font-bold tracking-tight flex items-center gap-2">
                <Shield className="h-6 w-6 text-primary" />
                System Overview
              </h2>
              <p className="text-muted-foreground">
                Administrative statistics and platform metrics.
              </p>
            </div>
            
            <div className="flex justify-end">
              <Link href="/dashboard/admin/documentation">
                <Button variant="outline" className="gap-2">
                  <FileText className="h-4 w-4" />
                  Developer Documentation
                </Button>
              </Link>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-6">
              <StatCard
                title="Total Users"
                value={displayAdminStats.totalUsers.toString()}
                icon={Users}
                delay={350}
              />
              <StatCard
                title="Teachers"
                value={displayAdminStats.totalTeachers.toString()}
                icon={Users}
                delay={400}
              />
              <StatCard
                title="Students"
                value={displayAdminStats.totalStudents.toString()}
                icon={Users}
                delay={450}
              />
              <StatCard
                title="Total Songs"
                value={displayAdminStats.totalSongs.toString()}
                icon={Music}
                delay={500}
              />
              <StatCard
                title="Total Lessons"
                value={(displayAdminStats.totalLessons || 0).toString()}
                icon={BookOpen}
                delay={550}
              />
            </div>
            {token && (
              <div className="pt-4">
                <BearerTokenCard token={token} />
              </div>
            )}

            <div className="pt-4">
              <AnalyticsCharts />
            </div>
          </div>
        )}
      </main>
    </div>
  );
}
