import { AdminStatCard } from '@/components/dashboard/admin/AdminStatCard';

interface StudentStats {
  myTeacher: number;
  lessonsDone: number;
  songsLearning: number;
  progress: number;
}

interface StudentDashboardStatsProps {
  stats: StudentStats;
}

/**
 * Student Dashboard Statistics
 * Shows student-specific metrics - now receives data as props (SSR)
 */
export function StudentDashboardStats({ stats }: StudentDashboardStatsProps) {
  return (
    <div className="grid grid-cols-2 sm:grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-6 mb-6 sm:mb-8">
      <AdminStatCard icon="👨‍🏫" value={stats.myTeacher.toString()} label="My Teacher" />
      <AdminStatCard icon="📅" value={stats.lessonsDone.toString()} label="Lessons Done" />
      <AdminStatCard icon="🎵" value={stats.songsLearning.toString()} label="Songs Learning" />
      <AdminStatCard icon="⭐" value={stats.progress.toString()} label="Progress" />
    </div>
  );
}
