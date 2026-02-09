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

      return {
        id: profile.id,
        name: profile.full_name || 'Unknown',
        level: 'Intermediate' as const, // Mocked
        lessonsCompleted: lessonsCompleted || 0,
        nextLesson: nextLesson
          ? new Date(nextLesson.scheduled_at).toLocaleDateString()
          : 'No upcoming lessons',
        avatar: profile.avatar_url,
      };
    }) || []
  );

  // Mock Data for other components (to match guitar-mastery-hub for now)
  // In a real app, these would be complex queries
  const activities = [
    {
      id: '1',
      type: 'lesson_completed' as const,
      message: "Alex Thompson completed 'Blues Basics' lesson",
      time: '2 hours ago',
    },
    {
      id: '2',
      type: 'assignment_submitted' as const,
      message: "Sarah Chen submitted 'G Major Scale' practice",
      time: '4 hours ago',
    },
    {
      id: '3',
      type: 'song_added' as const,
      message: "New song added: 'Hotel California' by Eagles",
      time: 'Yesterday',
    },
    {
      id: '4',
      type: 'assignment_due' as const,
      message: '3 assignments due tomorrow',
      time: 'Reminder',
    },
    {
      id: '5',
      type: 'lesson_completed' as const,
      message: "Marcus Williams completed 'Jazz Voicings'",
      time: 'Yesterday',
    },
  ];

  const chartData = [
    { name: 'Mon', lessons: 4, assignments: 2 },
    { name: 'Tue', lessons: 6, assignments: 4 },
    { name: 'Wed', lessons: 8, assignments: 3 },
    { name: 'Thu', lessons: 5, assignments: 5 },
    { name: 'Fri', lessons: 9, assignments: 6 },
    { name: 'Sat', lessons: 12, assignments: 8 },
    { name: 'Sun', lessons: 7, assignments: 4 },
  ];

  const songs = [
    {
      id: '1',
      title: 'Wonderwall',
      artist: 'Oasis',
      difficulty: 'Easy' as const,
      duration: '4:18',
      studentsLearning: 8,
    },
    {
      id: '2',
      title: 'Hotel California',
      artist: 'Eagles',
      difficulty: 'Hard' as const,
      duration: '6:30',
      studentsLearning: 3,
    },
    {
      id: '3',
      title: 'Blackbird',
      artist: 'The Beatles',
      difficulty: 'Medium' as const,
      duration: '2:18',
      studentsLearning: 5,
    },
    {
      id: '4',
      title: 'Tears in Heaven',
      artist: 'Eric Clapton',
      difficulty: 'Medium' as const,
      duration: '4:33',
      studentsLearning: 4,
    },
  ];

  const assignments = [
    {
      id: '1',
      title: 'Practice G Major Scale',
      studentName: 'Sarah Chen',
      dueDate: 'Dec 12',
      status: 'pending' as const,
    },
    {
      id: '2',
      title: 'Learn Intro Riff',
      studentName: 'Alex Thompson',
      dueDate: 'Dec 11',
      status: 'submitted' as const,
      songTitle: 'Smoke on the Water',
    },
    {
      id: '3',
      title: 'Chord Transitions Exercise',
      studentName: 'Emma Rodriguez',
      dueDate: 'Dec 10',
      status: 'overdue' as const,
    },
    {
      id: '4',
      title: 'Fingerpicking Pattern #3',
      studentName: 'Marcus Williams',
      dueDate: 'Dec 8',
      status: 'completed' as const,
    },
  ];

  return {
    students,
    activities,
    chartData,
    songs,
    assignments,
    stats: {
      totalStudents: students.length,
      songsInLibrary: 48, // Mocked
      lessonsThisWeek: 32, // Mocked
      pendingAssignments: 8, // Mocked
    },
  };
}
