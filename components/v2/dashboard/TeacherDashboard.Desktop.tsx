'use client';

import { motion } from 'framer-motion';
import { staggerContainer, listItem } from '@/lib/animations/variants';
import { StatsWidget } from './widgets/StatsWidget';
import { AgendaWidget } from './widgets/AgendaWidget';
import { AttentionWidget } from './widgets/AttentionWidget';
import { SongOfTheWeekCard } from '@/components/song-of-the-week';
import { StudentList } from '@/components/dashboard/teacher/StudentList';
import { SongLibrary } from '@/components/dashboard/teacher/SongLibrary';
import { RecentActivity } from '@/components/dashboard/student/RecentActivity';
import { ProgressChart } from '@/components/dashboard/student/ProgressChart';
import type { TeacherDashboardV2Props } from './TeacherDashboard';

export default function TeacherDashboardDesktop({
  data,
  fullName,
  email,
  isAdmin,
  sotw,
}: TeacherDashboardV2Props) {
  const displayName = fullName || email || 'Coach';

  return (
    <div className="w-full max-w-7xl mx-auto px-6 lg:px-8 py-6 space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-2xl lg:text-3xl font-bold tracking-tight">
          Welcome back,{' '}
          <span className="text-primary">{displayName}</span>
        </h1>
        <p className="text-sm text-muted-foreground mt-1">
          Here&apos;s what&apos;s happening with your guitar students today.
        </p>
      </div>

      {/* Stats row */}
      <StatsWidget
        totalStudents={data.stats.totalStudents}
        songsInLibrary={data.stats.songsInLibrary}
        lessonsThisWeek={data.stats.lessonsThisWeek}
        pendingAssignments={data.stats.pendingAssignments}
      />

      {/* Two-column layout: Agenda + Attention */}
      <motion.div
        variants={staggerContainer}
        initial="hidden"
        animate="visible"
        className="grid grid-cols-1 lg:grid-cols-2 gap-6"
      >
        <motion.div variants={listItem}>
          <AgendaWidget items={data.agenda} />
        </motion.div>
        <motion.div variants={listItem}>
          <AttentionWidget />
        </motion.div>
      </motion.div>

      {/* Song of the Week */}
      {sotw && <SongOfTheWeekCard sotw={sotw} isAdmin={isAdmin} />}

      {/* Three-column: Students + Songs + Activity */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2 space-y-6">
          <StudentList students={data.students} />
          <SongLibrary songs={data.songs} />
        </div>
        <div className="space-y-6">
          <RecentActivity activities={data.activities} />
        </div>
      </div>

      {/* Chart */}
      <ProgressChart data={data.chartData} />
    </div>
  );
}
