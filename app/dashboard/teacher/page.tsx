import { RequireTeacher } from '@/components/auth';
import { TeacherDashboardStats } from '@/components/dashboard/teacher/TeacherDashboardStats';
import { TeacherStudentsList } from '@/components/dashboard/teacher/TeacherStudentsList';
import { TeacherRecentLessons } from '@/components/dashboard/teacher/TeacherRecentLessons';
import { TeacherLessonSchedule } from '@/components/dashboard/teacher/TeacherLessonSchedule';
import { getUserWithRolesSSR } from '@/lib/getUserWithRolesSSR';
import { createClient } from '@/lib/supabase/server';

interface TeacherStats {
  myStudents: number;
  activeLessons: number;
  songsLibrary: number;
  studentProgress: number;
}

async function fetchTeacherStats(): Promise<TeacherStats> {
  try {
    const supabase = await createClient();
    const { user } = await getUserWithRolesSSR();

    if (!user) {
      return {
        myStudents: 0,
        activeLessons: 0,
        songsLibrary: 0,
        studentProgress: 0,
      };
    }

    // Teacher stats - similar to the API route but server-side
    const [{ count: myStudents }, { count: activeLessons }, { count: songsLibrary }] =
      await Promise.all([
        supabase
          .from('lessons')
          .select('*', { count: 'exact', head: true })
          .eq('teacher_id', user.id),
        supabase
          .from('lessons')
          .select('*', { count: 'exact', head: true })
          .eq('teacher_id', user.id)
          .eq('status', 'IN_PROGRESS'),
        supabase.from('songs').select('*', { count: 'exact', head: true }),
      ]);

    return {
      myStudents: myStudents || 0,
      activeLessons: activeLessons || 0,
      songsLibrary: songsLibrary || 0,
      studentProgress: 0, // TODO: Calculate average progress
    };
  } catch (error) {
    console.error('Error fetching teacher stats:', error);
    return {
      myStudents: 0,
      activeLessons: 0,
      songsLibrary: 0,
      studentProgress: 0,
    };
  }
}

export default async function TeacherDashboard() {
  const { isTeacher } = await getUserWithRolesSSR();

  if (!isTeacher) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <h1 className="text-2xl font-bold text-red-600 mb-2">Access Denied</h1>
          <p className="text-gray-600">You must be a teacher to access this page.</p>
        </div>
      </div>
    );
  }

  const stats = await fetchTeacherStats();

  return (
    <RequireTeacher>
      <div className="min-h-screen bg-linear-to-br from-blue-50 to-indigo-100 dark:from-gray-900 dark:to-gray-800">
        <main className="container mx-auto px-3 sm:px-4 py-4 sm:py-8 max-w-7xl">
          <header className="mb-6 sm:mb-8">
            <h1 className="text-2xl sm:text-3xl lg:text-4xl font-bold text-gray-900 dark:text-white mb-2">
              👨‍🏫 Teacher Dashboard
            </h1>
            <p className="text-sm sm:text-base lg:text-lg text-gray-600 dark:text-gray-300">
              Manage your students, lessons, and progress tracking
            </p>
          </header>

          <TeacherDashboardStats stats={stats} />
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 sm:gap-8 mb-6 sm:mb-8">
            <div className="lg:col-span-2">
              <TeacherStudentsList />
            </div>
            <div>
              <TeacherLessonSchedule />
            </div>
          </div>
          <TeacherRecentLessons />
        </main>
      </div>
    </RequireTeacher>
  );
}
