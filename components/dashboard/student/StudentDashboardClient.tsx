'use client';

import { StudentDashboardData } from '@/app/actions/student/dashboard';
import { RecentActivity } from '@/components/dashboard/student/RecentActivity';
// import { ProgressChart } from '@/components/dashboard/student/ProgressChart';
import { SongLibrary } from '@/components/songs/student/SongLibrary';
import { AssignmentList } from '@/components/assignments/student/AssignmentList';
import { DashboardStatsGrid } from '@/components/dashboard/DashboardStatsGrid';
import { NextLessonCard } from '@/components/dashboard/student/NextLessonCard';
import { BearerTokenCard } from '@/components/dashboard/BearerTokenCard';

interface StudentDashboardClientProps {
  data: StudentDashboardData;
  email?: string;
  token?: string;
}

export function StudentDashboardClient({ data, token }: StudentDashboardClientProps) {
  // Transform data for components
  const activities = [
    ...(data.lastLesson
      ? [
          {
            id: 'lesson-' + data.lastLesson.id,
            type: 'lesson_completed' as const,
            message: `Completed lesson: ${data.lastLesson.title || 'Untitled'}`,
            time: new Date(data.lastLesson.scheduled_at).toLocaleDateString(),
          },
        ]
      : []),
    ...data.recentSongs.map((song) => ({
      id: 'song-' + song.id,
      type: 'song_added' as const,
      message: `Added song: ${song.title}`,
      time: new Date(song.last_played).toLocaleDateString(),
    })),
  ].slice(0, 5);

  /*
  const chartData = [
    { name: 'Mon', lessons: 1, assignments: 1 },
    { name: 'Tue', lessons: 2, assignments: 0 },
    { name: 'Wed', lessons: 1, assignments: 2 },
    { name: 'Thu', lessons: 0, assignments: 1 },
    { name: 'Fri', lessons: 3, assignments: 2 },
    { name: 'Sat', lessons: 4, assignments: 3 },
    { name: 'Sun', lessons: 2, assignments: 1 },
  ];
  */

  const songs = data.recentSongs.map((s) => ({
    id: s.id,
    title: s.title,
    artist: s.artist,
    difficulty: 'Medium' as const, // Mocked
    duration: '3:45', // Mocked
    studentsLearning: 12, // Mocked
  }));

  const assignments = data.assignments.map((a) => ({
    id: a.id,
    title: a.title,
    studentName: 'You', // Mocked
    dueDate: a.due_date || 'No due date',
    status: (a.status === 'completed'
      ? 'completed'
      : a.status === 'overdue'
      ? 'overdue'
      : 'pending') as 'pending' | 'completed' | 'overdue',
  }));

  return (
    <div className="space-y-8">
      <div className="flex flex-col gap-2 opacity-0 animate-fade-in">
        <h1 className="text-3xl font-bold tracking-tight">Welcome back, Student!</h1>
        <p className="text-muted-foreground">
          Here&apos;s what&apos;s happening with your guitar journey.
        </p>
      </div>

      {/* API-driven stats */}
      <DashboardStatsGrid />

      <NextLessonCard lesson={data.nextLesson} />

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        <div className="lg:col-span-2 space-y-8">
          {/* <ProgressChart data={chartData} /> */}
          <SongLibrary songs={songs} />
        </div>
        <div className="space-y-8">
          <RecentActivity activities={activities} />
          <AssignmentList assignments={assignments} />
        </div>
      </div>

      {token && (
        <div className="pt-8 border-t">
          <BearerTokenCard token={token} />
        </div>
      )}
    </div>
  );
}
