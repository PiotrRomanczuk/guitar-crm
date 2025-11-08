import { RequireStudent } from '@/components/auth';
import { StudentDashboardStats } from '@/components/dashboard/student/StudentDashboardStats';
import { StudentRecentLessons } from '@/components/dashboard/student/StudentRecentLessons';
import { StudentProgressOverview } from '@/components/dashboard/student/StudentProgressOverview';
import { StudentUpcomingLessons } from '@/components/dashboard/student/StudentUpcomingLessons';
import { getUserWithRolesSSR } from '@/lib/getUserWithRolesSSR';
import { createClient } from '@/lib/supabase/server';

interface StudentStats {
  myTeacher: number;
  lessonsDone: number;
  songsLearning: number;
  progress: number;
}

async function fetchStudentStats(): Promise<StudentStats> {
  try {
    const supabase = await createClient();
    const { user } = await getUserWithRolesSSR();

    // Get lessons for this student
    const { data: lessons } = await supabase
      .from('lessons')
      .select('id, teacher_id, lesson_teacher_number')
      .eq('student_id', user.id);

    const lessonIds = lessons?.map((l) => l.id) || [];

    // Get songs count for these lessons
    const { count: songsLearning } = await supabase
      .from('lesson_songs')
      .select('*', { count: 'exact', head: true })
      .in('lesson_id', lessonIds);

    const uniqueTeachers = new Set(lessons?.map((l) => l.teacher_id)).size;
    const lessonsDone = lessons?.length || 0;

    return {
      myTeacher: uniqueTeachers || 0,
      lessonsDone: lessonsDone,
      songsLearning: songsLearning || 0,
      progress: 0, // TODO: Calculate progress percentage
    };
  } catch (error) {
    console.error('Error fetching student stats:', error);
    return {
      myTeacher: 0,
      lessonsDone: 0,
      songsLearning: 0,
      progress: 0,
    };
  }
}

export default async function StudentDashboard() {
  const { user, isStudent } = await getUserWithRolesSSR();

  if (!isStudent) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <h1 className="text-2xl font-bold text-red-600 mb-2">Access Denied</h1>
          <p className="text-gray-600">You must be a student to access this page.</p>
        </div>
      </div>
    );
  }

  const stats = await fetchStudentStats();

  return (
    <RequireStudent>
      <div className="min-h-screen bg-linear-to-br from-green-50 to-emerald-100 dark:from-gray-900 dark:to-gray-800">
        <main className="container mx-auto px-3 sm:px-4 py-4 sm:py-8 max-w-7xl">
          <header className="mb-6 sm:mb-8">
            <h1 className="text-2xl sm:text-3xl lg:text-4xl font-bold text-gray-900 dark:text-white mb-2">
              🎵 Your Learning Dashboard
            </h1>
            <p className="text-sm sm:text-base lg:text-lg text-gray-600 dark:text-gray-300">
              Track your progress and manage your lessons
            </p>
          </header>

          <StudentDashboardStats stats={stats} />
          <StudentUpcomingLessons />
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 sm:gap-8">
            <StudentRecentLessons />
            <StudentProgressOverview />
          </div>
        </main>
      </div>
    </RequireStudent>
  );
}
