'use server';

import { createClient } from '@/lib/supabase/server';
import { getUserWithRolesSSR } from '@/lib/getUserWithRolesSSR';

export type TeacherDashboardData = {
  students: {
    id: string;
    name: string;
    level: 'Beginner' | 'Intermediate' | 'Advanced';
    lessonsCompleted: number;
    nextLesson: string;
    avatar?: string;
  }[];
  activities: {
    id: string;
    type: 'lesson_completed' | 'song_added' | 'assignment_due' | 'assignment_submitted';
    message: string;
    time: string;
  }[];
  chartData: {
    name: string;
    lessons: number;
    assignments: number;
  }[];
  songs: {
    id: string;
    title: string;
    artist: string;
    difficulty: 'Easy' | 'Medium' | 'Hard';
    duration: string;
    studentsLearning: number;
  }[];
  assignments: {
    id: string;
    title: string;
    studentName: string;
    dueDate: string;
    status: 'pending' | 'submitted' | 'overdue' | 'completed';
    songTitle?: string;
  }[];
  stats: {
    totalStudents: number;
    songsInLibrary: number;
    lessonsThisWeek: number;
    pendingAssignments: number;
  };
};

const DIFFICULTY_MAP: Record<string, 'Easy' | 'Medium' | 'Hard'> = {
  beginner: 'Easy',
  intermediate: 'Medium',
  advanced: 'Hard',
};

const DAY_NAMES = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];

function getLevelFromLessonCount(count: number): 'Beginner' | 'Intermediate' | 'Advanced' {
  if (count >= 20) return 'Advanced';
  if (count >= 5) return 'Intermediate';
  return 'Beginner';
}

function getWeekBounds(): { weekStart: string; weekEnd: string } {
  const now = new Date();
  const dayOfWeek = now.getDay();
  const start = new Date(now);
  start.setDate(now.getDate() - dayOfWeek);
  start.setHours(0, 0, 0, 0);
  const end = new Date(start);
  end.setDate(start.getDate() + 7);
  return { weekStart: start.toISOString(), weekEnd: end.toISOString() };
}

export async function getTeacherDashboardData(): Promise<TeacherDashboardData> {
  const { user, isTeacher, isAdmin } = await getUserWithRolesSSR();

  if (!user || (!isTeacher && !isAdmin)) {
    throw new Error('Unauthorized');
  }

  const supabase = await createClient();

  // Fetch students using profiles table boolean flags
  const { data: studentProfiles } = await supabase
    .from('profiles')
    .select('id, full_name, avatar_url')
    .eq('is_student', true);

  // Fetch stats for each student
  const students = await Promise.all(
    studentProfiles?.map(async (profile) => {
      const { count: lessonsCompleted } = await supabase
        .from('lessons')
        .select('*', { count: 'exact', head: true })
        .eq('student_id', profile.id)
        .lt('scheduled_at', new Date().toISOString());

      const { data: nextLesson } = await supabase
        .from('lessons')
        .select('scheduled_at')
        .eq('student_id', profile.id)
        .gt('scheduled_at', new Date().toISOString())
        .order('scheduled_at', { ascending: true })
        .limit(1)
        .single();

      const completedCount = lessonsCompleted || 0;

      return {
        id: profile.id,
        name: profile.full_name || 'Unknown',
        level: getLevelFromLessonCount(completedCount),
        lessonsCompleted: completedCount,
        nextLesson: nextLesson
          ? new Date(nextLesson.scheduled_at).toLocaleDateString()
          : 'No upcoming lessons',
        avatar: profile.avatar_url,
      };
    }) || []
  );

  // Activities: no real backend yet, return empty array
  const activities: TeacherDashboardData['activities'] = [];

  // Chart data: real lesson counts per day of current week
  const { weekStart, weekEnd } = getWeekBounds();
  const { data: weekLessons } = await supabase
    .from('lessons')
    .select('scheduled_at')
    .gte('scheduled_at', weekStart)
    .lt('scheduled_at', weekEnd);

  const lessonsByDay = new Map<number, number>();
  const weekLessonsList = Array.isArray(weekLessons) ? weekLessons : [];
  for (const lesson of weekLessonsList) {
    const day = new Date(lesson.scheduled_at).getDay();
    lessonsByDay.set(day, (lessonsByDay.get(day) || 0) + 1);
  }

  const chartData: TeacherDashboardData['chartData'] = DAY_NAMES.map((name, index) => ({
    name,
    lessons: lessonsByDay.get(index) || 0,
    assignments: 0,
  }));

  // Songs: query real songs from the songs table
  const { data: songRows } = await supabase
    .from('songs')
    .select('id, title, author, level')
    .order('created_at', { ascending: false })
    .limit(10);

  const songs: TeacherDashboardData['songs'] = (songRows || []).map((song) => ({
    id: song.id,
    title: song.title,
    artist: song.author,
    difficulty: DIFFICULTY_MAP[song.level] || 'Medium',
    duration: '',
    studentsLearning: 0,
  }));

  // Assignments: no real dashboard-format backend yet, return empty array
  const assignments: TeacherDashboardData['assignments'] = [];

  // Real stats from Supabase
  const { count: songsCount } = await supabase
    .from('songs')
    .select('*', { count: 'exact', head: true });

  const { count: lessonsThisWeekCount } = await supabase
    .from('lessons')
    .select('*', { count: 'exact', head: true })
    .gte('scheduled_at', weekStart)
    .lt('scheduled_at', weekEnd);

  const { count: pendingAssignmentsCount } = await supabase
    .from('assignments')
    .select('*', { count: 'exact', head: true })
    .in('status', ['OPEN', 'IN_PROGRESS']);

  return {
    students,
    activities,
    chartData,
    songs,
    assignments,
    stats: {
      totalStudents: students.length,
      songsInLibrary: songsCount || 0,
      lessonsThisWeek: lessonsThisWeekCount || 0,
      pendingAssignments: pendingAssignmentsCount || 0,
    },
  };
}
