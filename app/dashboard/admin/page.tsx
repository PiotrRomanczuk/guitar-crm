import { RequireAdmin } from '@/components/auth';
import { AdminStatCard } from '@/components/dashboard/admin/AdminStatCard';
import { AdminActionCard } from '@/components/dashboard/admin/AdminActionCard';
import { createClient } from '@/lib/supabase/server';
import { AdminDashboardClient } from '@/components/dashboard/admin/AdminDashboardClient';

async function fetchDashboardStats() {
  const supabase = await createClient();

  try {
    // Fetch all stats in parallel
    const [songsResult, profilesResult, lessonsResult] = await Promise.all([
      supabase.from('songs').select('id', { count: 'exact', head: true }),
      supabase.from('profiles').select('is_admin, is_teacher, is_student'),
      supabase.from('lessons').select('id', { count: 'exact', head: true }),
    ]);

    const totalSongs = songsResult.count || 0;
    const totalLessons = lessonsResult.count || 0;

    // Count users by role
    const profiles = profilesResult.data || [];
    const totalUsers = profiles.length;
    const totalTeachers = profiles.filter((p) => p.is_teacher).length;
    const totalStudents = profiles.filter((p) => p.is_student).length;

    return {
      totalUsers,
      totalTeachers,
      totalStudents,
      totalSongs,
      totalLessons,
      myStudents: 0, // TODO: Calculate for teacher view
      activeLessons: totalLessons,
      songsLibrary: totalSongs,
      studentProgress: 0, // TODO: Calculate progress
      myTeacher: 0, // TODO: Get teacher for student
      lessonsDone: 0, // TODO: Calculate completed lessons
      songsLearning: 0, // TODO: Calculate songs in progress
      progress: 0, // TODO: Calculate progress percentage
    };
  } catch (error) {
    console.error('Error fetching dashboard stats:', error);
    return {
      totalUsers: 0,
      totalTeachers: 0,
      totalStudents: 0,
      totalSongs: 0,
      totalLessons: 0,
      myStudents: 0,
      activeLessons: 0,
      songsLibrary: 0,
      studentProgress: 0,
      myTeacher: 0,
      lessonsDone: 0,
      songsLearning: 0,
      progress: 0,
    };
  }
}

export default async function AdminDashboard() {
  const stats = await fetchDashboardStats();

  return (
    <RequireAdmin>
      <AdminDashboardClient stats={stats} />
    </RequireAdmin>
  );
}
