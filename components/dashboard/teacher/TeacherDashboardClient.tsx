'use client';

import { TeacherDashboardData } from '@/app/actions/teacher/dashboard';
import { StudentList } from '@/components/teacher/dashboard/StudentList';
import { StatCard } from '@/components/student/dashboard/StatCard';
import { RecentActivity } from '@/components/student/dashboard/RecentActivity'; // Reusing generic one
import { ProgressChart } from '@/components/student/dashboard/ProgressChart'; // Reusing generic one
import { SongLibrary } from '@/components/teacher/dashboard/SongLibrary';
import { AssignmentList } from '@/components/teacher/dashboard/AssignmentList';
import { DashboardStatsGrid } from '@/components/dashboard/DashboardStatsGrid';
import { LessonStatsOverview } from '@/components/dashboard/LessonStatsOverview';
import { Users, BookOpen, Music, ClipboardList, Shield } from 'lucide-react';

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
}

export function TeacherDashboardClient({ data, adminStats }: TeacherDashboardClientProps) {
  return (
    <div className="min-h-screen bg-background font-sans">
      <main className="container mx-auto px-4 py-8 max-w-7xl space-y-8">
        <div className="flex flex-col gap-2 opacity-0 animate-fade-in">
          <h1 className="text-3xl font-bold tracking-tight">
            Welcome back, <span className="text-primary">{adminStats ? 'Admin' : 'Coach'}</span>
          </h1>
          <p className="text-muted-foreground">
            Here&apos;s what&apos;s happening with your guitar students today.
          </p>
        </div>

        {/* API-driven stats */}
        <DashboardStatsGrid />

        {/* Legacy stats for additional context */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          <StatCard
            title="Total Students"
            value={data.stats.totalStudents.toString()}
            change="+3 this month"
            changeType="positive"
            icon={Users}
            delay={50}
          />
          <StatCard
            title="Songs in Library"
            value={data.stats.songsInLibrary.toString()}
            change="+5 new songs"
            changeType="positive"
            icon={Music}
            delay={100}
          />
          <StatCard
            title="Lessons This Week"
            value={data.stats.lessonsThisWeek.toString()}
            change="+12% from last week"
            changeType="positive"
            icon={BookOpen}
            delay={150}
          />
          <StatCard
            title="Pending Assignments"
            value={data.stats.pendingAssignments.toString()}
            change="3 due today"
            changeType="neutral"
            icon={ClipboardList}
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
        </div> className="space-y-8">
            <RecentActivity activities={data.activities} />
            <AssignmentList assignments={data.assignments} />
          </div>
        </div>

        {/* Admin Section */}
        {adminStats && (
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

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-6">
              <StatCard
                title="Total Users"
                value={adminStats.totalUsers.toString()}
                icon={Users}
                delay={350}
              />
              <StatCard
                title="Teachers"
                value={adminStats.totalTeachers.toString()}
                icon={Users}
                delay={400}
              />
              <StatCard
                title="Students"
                value={adminStats.totalStudents.toString()}
                icon={Users}
                delay={450}
              />
              <StatCard
                title="Total Songs"
                value={adminStats.totalSongs.toString()}
                icon={Music}
                delay={500}
              />
              <StatCard
                title="Total Lessons"
                value={adminStats.totalLessons.toString()}
                icon={BookOpen}
                delay={550}
              />
            </div>
          </div>
        )}
      </main>
    </div>
  );
}
