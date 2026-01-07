'use client';

import { TeacherDashboardData } from '@/app/actions/teacher/dashboard';
import { StudentList } from '@/components/dashboard/teacher/StudentList';
import { StatsCard } from '@/components/dashboard/StatsCard';
import { RecentActivity } from '@/components/dashboard/student/RecentActivity'; // Reusing generic one
import { ProgressChart } from '@/components/dashboard/student/ProgressChart'; // Reusing generic one
import { SongLibrary } from '@/components/dashboard/teacher/SongLibrary';
import { AssignmentList } from '@/components/dashboard/teacher/AssignmentList';
import { LessonStatsOverview } from '@/components/dashboard/LessonStatsOverview';
import { TodaysAgenda } from '@/components/dashboard/TodaysAgenda';
import { NotificationsAlertsSection } from '@/components/dashboard/NotificationsAlertsSection';
import { WelcomeTour } from '@/components/dashboard/WelcomeTour';
import { WeeklySummaryCard } from '@/components/dashboard/WeeklySummaryCard';
import { NeedsAttentionCard } from '@/components/dashboard/NeedsAttentionCard';
import { StudentPipeline } from '@/components/dashboard/pipeline/StudentPipeline';
import { HealthAlertsBanner } from '@/components/dashboard/health/HealthAlertsBanner';
import { HealthSummaryWidget } from '@/components/dashboard/health/HealthSummaryWidget';
import { useDashboardStats, AdminStats as DashboardAdminStats } from '@/hooks/useDashboardStats';
import { Users, BookOpen, Music, Shield } from 'lucide-react';

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
  fullName?: string | null;
  adminStats?: AdminStats;
}

export function TeacherDashboardClient({
  data,
  email,
  fullName,
  adminStats,
}: TeacherDashboardClientProps) {
  const { data: dashboardData } = useDashboardStats();
  const apiAdminStats =
    dashboardData?.role === 'admin' ? (dashboardData.stats as DashboardAdminStats) : null;

  // Use API stats if available, fallback to prop stats for backwards compatibility
  const displayAdminStats = apiAdminStats || adminStats;

  return (
    <div className="w-full max-w-full overflow-x-hidden min-w-0">
      <div className="space-y-4 sm:space-y-6 lg:space-y-8 w-full max-w-full">
        <div className="flex flex-col gap-1 sm:gap-2 opacity-0 animate-fade-in">
          <h1 className="text-xl sm:text-2xl md:text-3xl lg:text-4xl font-bold tracking-tight">
            Welcome back,{' '}
            <span className="text-primary">
              {fullName || email || (displayAdminStats ? 'Admin' : 'Coach')}
            </span>
          </h1>
          <p className="text-sm sm:text-base text-muted-foreground">
            Here&apos;s what&apos;s happening with your guitar students today.
          </p>
        </div>

        {/* Notifications & Alerts */}
        <NotificationsAlertsSection />

        {/* Health Alerts Banner */}
        <HealthAlertsBanner />

        {/* Stats Grid - Lesson Statistics and Today's Agenda */}
        <div className="grid grid-cols-1 portrait:grid-cols-1 lg:grid-cols-3 ultrawide:grid-cols-4 gap-4 sm:gap-6 min-w-0 w-full">
          <div className="lg:col-span-2 ultrawide:col-span-3 min-w-0">
            <LessonStatsOverview />
          </div>
          <div data-tour="todays-agenda" className="min-w-0">
            <TodaysAgenda items={[]} />
          </div>
        </div>

        {/* Needs Attention, Weekly Summary, and Health */}
        <div className="grid grid-cols-1 sm:grid-cols-2 portrait:grid-cols-1 lg:grid-cols-3 ultrawide:grid-cols-6 gap-4 sm:gap-6 min-w-0 w-full">
          <div className="ultrawide:col-span-2 min-w-0">
            <NeedsAttentionCard />
          </div>
          <div className="ultrawide:col-span-2 min-w-0">
            <WeeklySummaryCard />
          </div>
          <div className="ultrawide:col-span-2 min-w-0">
            <HealthSummaryWidget />
          </div>
        </div>

        {/* Student Pipeline */}
        <StudentPipeline />

        {/* Student Management */}
        <div className="grid grid-cols-1 portrait:grid-cols-1 lg:grid-cols-3 ultrawide:grid-cols-5 gap-4 sm:gap-6 lg:gap-8 min-w-0 w-full">
          <div
            className="lg:col-span-2 ultrawide:col-span-3 space-y-4 sm:space-y-6 lg:space-y-8 min-w-0"
            data-tour="student-list"
          >
            <StudentList students={data.students} />
            <SongLibrary songs={data.songs} />
          </div>
          <div className="lg:col-span-1 ultrawide:col-span-2 space-y-4 sm:space-y-6 lg:space-y-8 min-w-0">
            <RecentActivity activities={data.activities} />
            <AssignmentList assignments={data.assignments} />
          </div>
        </div>

        {/* Progress Chart - Full Width */}
        <ProgressChart data={data.chartData} />

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

            <div className="grid grid-cols-1 xs:grid-cols-2 sm:grid-cols-3 portrait:grid-cols-2 lg:grid-cols-5 ultrawide:grid-cols-10 gap-3 sm:gap-4 lg:gap-6 min-w-0 w-full">
              <div className="ultrawide:col-span-2 min-w-0">
                <StatsCard
                  title="Total Users"
                  value={displayAdminStats.totalUsers.toString()}
                  icon={Users}
                  delay={350}
                  variant="gradient"
                  href="/dashboard/users"
                  iconColor="text-blue-600"
                  iconBgColor="bg-blue-500/10 group-hover:bg-blue-500/20"
                />
              </div>
              <div className="ultrawide:col-span-2 min-w-0">
                <StatsCard
                  title="Teachers"
                  value={displayAdminStats.totalTeachers.toString()}
                  icon={Users}
                  delay={400}
                  variant="gradient"
                  href="/dashboard/users?filter=teacher"
                  iconColor="text-purple-600"
                  iconBgColor="bg-purple-500/10 group-hover:bg-purple-500/20"
                />
              </div>
              <div className="ultrawide:col-span-2 min-w-0">
                <StatsCard
                  title="Students"
                  value={displayAdminStats.totalStudents.toString()}
                  icon={Users}
                  delay={450}
                  variant="gradient"
                  href="/dashboard/users?filter=student"
                  iconColor="text-green-600"
                  iconBgColor="bg-green-500/10 group-hover:bg-green-500/20"
                />
              </div>
              <div className="ultrawide:col-span-2 min-w-0">
                <StatsCard
                  title="Total Songs"
                  value={displayAdminStats.totalSongs.toString()}
                  icon={Music}
                  delay={500}
                  variant="gradient"
                  href="/dashboard/songs"
                  iconColor="text-orange-600"
                  iconBgColor="bg-orange-500/10 group-hover:bg-orange-500/20"
                />
              </div>
              <div className="ultrawide:col-span-2 min-w-0">
                <StatsCard
                  title="Total Lessons"
                  value={(displayAdminStats.totalLessons || 0).toString()}
                  icon={BookOpen}
                  delay={550}
                  variant="gradient"
                  href="/dashboard/lessons"
                  iconColor="text-pink-600"
                  iconBgColor="bg-pink-500/10 group-hover:bg-pink-500/20"
                />
              </div>
            </div>
          </div>
        )}

        {/* Welcome Tour */}
        <WelcomeTour firstName={fullName?.split(' ')[0]} />
      </div>
    </div>
  );
}
