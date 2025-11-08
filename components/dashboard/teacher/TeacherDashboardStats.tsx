import { AdminStatCard } from '@/components/dashboard/admin/AdminStatCard';

interface TeacherStats {
  myStudents: number;
  activeLessons: number;
  songsLibrary: number;
  studentProgress: number;
}

interface TeacherDashboardStatsProps {
  stats: TeacherStats;
}

/**
 * Teacher Dashboard Statistics
 * Shows teacher-specific metrics - now receives data as props (SSR)
 */
export function TeacherDashboardStats({ stats }: TeacherDashboardStatsProps) {
  return (
    <div className="grid grid-cols-2 sm:grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-6 mb-6 sm:mb-8">
      <AdminStatCard icon="👨‍🎓" value={stats.myStudents.toString()} label="My Students" />
      <AdminStatCard icon="🎯" value={stats.activeLessons.toString()} label="Active Lessons" />
      <AdminStatCard icon="🎵" value={stats.songsLibrary.toString()} label="Songs Library" />
      <AdminStatCard icon="📊" value={stats.studentProgress.toString()} label="Student Progress" />
    </div>
  );
}
