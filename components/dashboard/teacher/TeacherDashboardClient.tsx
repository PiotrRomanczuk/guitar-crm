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

// Section wrapper for consistent spacing and optional titles
function DashboardSection({
  children,
  className = '',
}: {
  children: React.ReactNode;
  className?: string;
}) {
  return <section className={`${className}`}>{children}</section>;
}

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
    <div className="w-full max-w-full overflow-x-hidden min-w-0 px-1 sm:px-0">
      <div className="space-y-5 sm:space-y-6 lg:space-y-8 ultrawide:space-y-10 w-full max-w-full">
        {/* Welcome Header */}
        <DashboardSection className="opacity-0 animate-fade-in">
          <div className="flex flex-col gap-2">
            <h1 className="text-xl sm:text-2xl md:text-3xl lg:text-4xl font-bold tracking-tight">
              Welcome back,{' '}
              <span className="text-primary">
                {fullName || email || (displayAdminStats ? 'Admin' : 'Coach')}
              </span>
            </h1>
            <p className="text-sm sm:text-base text-muted-foreground max-w-2xl">
              Here&apos;s what&apos;s happening with your guitar students today.
            </p>
          </div>
        </DashboardSection>

        {/* Notifications & Alerts */}
        <DashboardSection>
          <NotificationsAlertsSection />
        </DashboardSection>

        {/* Health Alerts Banner */}
        <DashboardSection>
          <HealthAlertsBanner />
        </DashboardSection>

        {/* Stats Grid - Lesson Statistics and Today's Agenda */}
        <DashboardSection>
          <div className="grid grid-cols-1 md:grid-cols-2 portrait:grid-cols-2 lg:grid-cols-3 ultrawide:grid-cols-4 superwide:grid-cols-5 gap-4 sm:gap-5 lg:gap-6 ultrawide:gap-8 min-w-0 w-full">
            <div className="md:col-span-1 portrait:col-span-1 lg:col-span-2 ultrawide:col-span-3 superwide:col-span-4 min-w-0">
              <LessonStatsOverview />
            </div>
            <div data-tour="todays-agenda" className="min-w-0">
              <TodaysAgenda items={[]} />
            </div>
          </div>
        </DashboardSection>

        {/* Needs Attention, Weekly Summary, and Health */}
        <DashboardSection>
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 portrait:grid-cols-3 lg:grid-cols-3 ultrawide:grid-cols-6 superwide:grid-cols-6 gap-4 sm:gap-5 lg:gap-6 ultrawide:gap-8 min-w-0 w-full">
            <div className="ultrawide:col-span-2 min-w-0">
              <NeedsAttentionCard />
            </div>
            <div className="ultrawide:col-span-2 min-w-0">
              <WeeklySummaryCard />
            </div>
            <div className="sm:col-span-2 md:col-span-1 ultrawide:col-span-2 min-w-0">
              <HealthSummaryWidget />
            </div>
          </div>
        </DashboardSection>

        {/* Student Pipeline */}
        <DashboardSection>
          <StudentPipeline />
        </DashboardSection>

        {/* Student Management */}
        <DashboardSection>
          <div className="grid grid-cols-1 md:grid-cols-2 portrait:grid-cols-2 lg:grid-cols-3 ultrawide:grid-cols-5 superwide:grid-cols-6 gap-4 sm:gap-5 lg:gap-6 ultrawide:gap-8 min-w-0 w-full">
            <div
              className="md:col-span-1 portrait:col-span-1 lg:col-span-2 ultrawide:col-span-3 superwide:col-span-4 space-y-4 sm:space-y-5 lg:space-y-6 min-w-0"
              data-tour="student-list"
            >
              <StudentList students={data.students} />
              <SongLibrary songs={data.songs} />
            </div>
            <div className="lg:col-span-1 ultrawide:col-span-2 space-y-4 sm:space-y-5 lg:space-y-6 min-w-0">
              <RecentActivity activities={data.activities} />
              <AssignmentList assignments={data.assignments} />
            </div>
          </div>
        </DashboardSection>

        {/* Progress Chart - Full Width */}
        <DashboardSection>
          <ProgressChart data={data.chartData} />
        </DashboardSection>

        {/* Admin Section */}
        {displayAdminStats && (
          <DashboardSection>
            <div
              className="space-y-6 sm:space-y-8 pt-8 sm:pt-10 border-t border-border/60 opacity-0 animate-fade-in"
              style={{ animationDelay: '300ms', animationFillMode: 'forwards' }}
            >
              <div className="flex flex-col gap-2">
                <h2 className="text-xl sm:text-2xl font-bold tracking-tight flex items-center gap-3">
                  <div className="p-2 rounded-lg bg-primary/10">
                    <Shield className="h-5 w-5 sm:h-6 sm:w-6 text-primary" />
                  </div>
                  System Overview
                </h2>
                <p className="text-sm sm:text-base text-muted-foreground max-w-xl">
                  Administrative statistics and platform metrics.
                </p>
              </div>

              <div className="grid grid-cols-2 xs:grid-cols-2 sm:grid-cols-3 md:grid-cols-5 portrait:grid-cols-5 lg:grid-cols-5 ultrawide:grid-cols-10 superwide:grid-cols-10 gap-3 sm:gap-4 lg:gap-5 ultrawide:gap-6 min-w-0 w-full">
                <div className="ultrawide:col-span-2 min-w-0">
                  <StatsCard
                    title="Total Users"
                    value={displayAdminStats.totalUsers.toString()}
                    icon={Users}
                    delay={350}
                    variant="gradient"
                    href="/dashboard/users"
                    iconColor="text-primary"
                    iconBgColor="bg-primary/10 group-hover:bg-primary/20"
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
                    iconColor="text-primary"
                    iconBgColor="bg-primary/10 group-hover:bg-primary/20"
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
                    iconColor="text-success"
                    iconBgColor="bg-success/10 group-hover:bg-success/20"
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
                    iconColor="text-warning"
                    iconBgColor="bg-warning/10 group-hover:bg-warning/20"
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
                    iconColor="text-primary"
                    iconBgColor="bg-primary/10 group-hover:bg-primary/20"
                  />
                </div>
              </div>
            </div>
          </DashboardSection>
        )}

        {/* Welcome Tour */}
        <WelcomeTour firstName={fullName?.split(' ')[0]} />
      </div>
    </div>
  );
}
