/**
 * Weekly Insights Service
 * Aggregates weekly data for teacher insight emails
 */

import { createClient } from '@/lib/supabase/server';

interface ProfileData {
  id: string;
  full_name: string | null;
  email: string | null;
  created_at?: string;
}

interface LessonWithProfile {
  student_id: string;
  created_at: string;
  profiles: ProfileData | null;
}

interface SongProgressData {
  song_id: string;
  mastered_at: string;
  student_id: string;
  profiles: ProfileData | null;
  songs: {
    title: string | null;
  } | null;
}

interface AssignmentData {
  title: string;
  due_date: string;
  student_id: string;
  profiles: ProfileData | null;
}

interface StudentLessonData {
  student_id: string;
  profiles: ProfileData | null;
}

export interface WeeklyInsightsData {
  teacherId: string;
  teacherName: string;
  teacherEmail: string;
  dateRange: {
    start: string;
    end: string;
  };
  lessonsCompleted: number;
  newStudents: Array<{
    id: string;
    name: string;
    email: string;
    createdAt: string;
  }>;
  songsMastered: Array<{
    studentName: string;
    songTitle: string;
    masteredAt: string;
  }>;
  atRiskStudents: Array<{
    id: string;
    name: string;
    email: string;
    healthScore: number;
    overdueAssignments: number;
  }>;
  overdueAssignments: Array<{
    studentName: string;
    assignmentTitle: string;
    dueDate: string;
  }>;
  lessonsCancelled: number;
}

/**
 * Get weekly insights data for a teacher
 */
export async function getWeeklyInsightsData(
  teacherId: string,
  startDate: Date,
  endDate: Date
): Promise<WeeklyInsightsData> {
  const supabase = await createClient();

  // Get teacher profile
  const { data: teacherProfile } = await supabase
    .from('profiles')
    .select('full_name, email')
    .eq('id', teacherId)
    .single();

  // Get lessons completed this week
  const { count: lessonsCompleted } = await supabase
    .from('lessons')
    .select('*', { count: 'exact', head: true })
    .eq('teacher_id', teacherId)
    .eq('status', 'COMPLETED')
    .gte('scheduled_at', startDate.toISOString())
    .lte('scheduled_at', endDate.toISOString());

  // Get lessons cancelled this week
  const { count: lessonsCancelled } = await supabase
    .from('lessons')
    .select('*', { count: 'exact', head: true })
    .eq('teacher_id', teacherId)
    .eq('status', 'CANCELLED')
    .gte('scheduled_at', startDate.toISOString())
    .lte('scheduled_at', endDate.toISOString());

  // Get new students this week (students with first lesson this week)
  const { data: newStudentLessons } = await supabase
    .from('lessons')
    .select(
      `
      student_id,
      profiles!lessons_student_id_fkey (
        id,
        full_name,
        email,
        created_at
      )
    `
    )
    .eq('teacher_id', teacherId)
    .gte('created_at', startDate.toISOString())
    .lte('created_at', endDate.toISOString())
    .order('created_at', { ascending: true });

  const newStudents =
    (newStudentLessons as LessonWithProfile[] | null)
      ?.map((lesson) => {
        const profile = lesson.profiles;
        if (!profile) return null;
        return {
          id: profile.id,
          name: profile.full_name || profile.email || 'Unknown Student',
          email: profile.email || '',
          createdAt: profile.created_at || lesson.created_at,
        };
      })
      .filter((student): student is NonNullable<typeof student> => student !== null)
      .filter(
        (student, index, self) =>
          // Remove duplicates
          index === self.findIndex((s) => s.id === student.id)
      ) || [];

  // Get songs mastered this week
  const { data: masteredSongs } = await supabase
    .from('student_song_progress')
    .select(
      `
      song_id,
      mastered_at,
      student_id,
      profiles!student_song_progress_student_id_fkey (
        full_name,
        email
      ),
      songs (
        title
      )
    `
    )
    .eq('current_status', 'mastered')
    .gte('mastered_at', startDate.toISOString())
    .lte('mastered_at', endDate.toISOString());

  const songsMastered =
    (masteredSongs as SongProgressData[] | null)
      ?.map((progress) => ({
        studentName:
          progress.profiles?.full_name || progress.profiles?.email || 'Unknown Student',
        songTitle: progress.songs?.title || 'Unknown Song',
        masteredAt: progress.mastered_at,
      }))
      .filter((song) => song.studentName && song.songTitle) || [];

  // Get at-risk students (health score < 40)
  // Note: This requires student health calculation - simplified version here
  const { data: teacherStudents } = await supabase
    .from('lessons')
    .select('student_id, profiles!lessons_student_id_fkey (id, full_name, email)')
    .eq('teacher_id', teacherId);

  const uniqueStudentIds = [
    ...new Set(
      (teacherStudents as StudentLessonData[] | null)?.map((l) => l.student_id).filter(Boolean)
    ),
  ];

  const atRiskStudents: Array<{
    id: string;
    name: string;
    email: string;
    healthScore: number;
    overdueAssignments: number;
  }> = [];

  // For each student, calculate a simple health score based on recent activity
  for (const studentId of uniqueStudentIds) {
    const thirtyDaysAgo = new Date();
    thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);

    const { count: recentLessons } = await supabase
      .from('lessons')
      .select('*', { count: 'exact', head: true })
      .eq('student_id', studentId)
      .gte('created_at', thirtyDaysAgo.toISOString());

    const { data: overdueAssignmentsData } = await supabase
      .from('assignments')
      .select('*')
      .eq('student_id', studentId)
      .eq('status', 'pending')
      .lt('due_date', new Date().toISOString());

    const overdueCount = overdueAssignmentsData?.length || 0;

    // Simple health score: 100 if recent activity, penalty for overdue
    const healthScore = Math.max(0, 100 - (recentLessons || 0) * 20 + overdueCount * 15);

    if (healthScore < 40) {
      const student = (teacherStudents as StudentLessonData[] | null)?.find(
        (l) => l.student_id === studentId
      );
      const profile = student?.profiles;

      if (profile) {
        atRiskStudents.push({
          id: profile.id,
          name: profile.full_name || profile.email || 'Unknown Student',
          email: profile.email || '',
          healthScore,
          overdueAssignments: overdueCount,
        });
      }
    }
  }

  // Get overdue assignments
  const { data: overdueAssignmentsData } = await supabase
    .from('assignments')
    .select(
      `
      title,
      due_date,
      student_id,
      profiles!assignments_student_id_fkey (
        full_name,
        email
      )
    `
    )
    .eq('teacher_id', teacherId)
    .eq('status', 'pending')
    .lt('due_date', new Date().toISOString())
    .order('due_date', { ascending: true })
    .limit(10);

  const overdueAssignments =
    (overdueAssignmentsData as AssignmentData[] | null)?.map((assignment) => ({
      studentName:
        assignment.profiles?.full_name || assignment.profiles?.email || 'Unknown Student',
      assignmentTitle: assignment.title,
      dueDate: assignment.due_date,
    })) || [];

  return {
    teacherId,
    teacherName: teacherProfile?.full_name || teacherProfile?.email || 'Teacher',
    teacherEmail: teacherProfile?.email || '',
    dateRange: {
      start: startDate.toISOString(),
      end: endDate.toISOString(),
    },
    lessonsCompleted: lessonsCompleted || 0,
    newStudents,
    songsMastered,
    atRiskStudents,
    overdueAssignments,
    lessonsCancelled: lessonsCancelled || 0,
  };
}

/**
 * Get date range for previous week (Monday to Sunday)
 */
export function getLastWeekDateRange(): { start: Date; end: Date } {
  const now = new Date();
  const dayOfWeek = now.getDay(); // 0 = Sunday, 1 = Monday, etc.

  // Calculate last Monday
  const daysToLastMonday = dayOfWeek === 0 ? 6 : dayOfWeek - 1; // If Sunday, go back 6 days
  const lastMonday = new Date(now);
  lastMonday.setDate(now.getDate() - daysToLastMonday - 7); // Go back to previous week's Monday
  lastMonday.setHours(0, 0, 0, 0);

  // Calculate last Sunday
  const lastSunday = new Date(lastMonday);
  lastSunday.setDate(lastMonday.getDate() + 6);
  lastSunday.setHours(23, 59, 59, 999);

  return {
    start: lastMonday,
    end: lastSunday,
  };
}
