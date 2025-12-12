'use client';

import { StudentDashboardData } from '@/app/actions/student/dashboard';
import { StatCard } from '@/components/student/dashboard/StatCard';
import { RecentActivity } from '@/components/student/dashboard/RecentActivity';
import { ProgressChart } from '@/components/student/dashboard/ProgressChart';
import { SongLibrary } from '@/components/student/songs/SongLibrary';
import { AssignmentList } from '@/components/student/assignments/AssignmentList';
import { Music, BookOpen, ClipboardList, Clock } from 'lucide-react';

interface StudentDashboardClientProps {
  data: StudentDashboardData;
  email?: string;
}

export function StudentDashboardClient({ data }: StudentDashboardClientProps) {
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

  const chartData = [
    { name: 'Mon', lessons: 1, assignments: 1 },
    { name: 'Tue', lessons: 2, assignments: 0 },
    { name: 'Wed', lessons: 1, assignments: 2 },
    { name: 'Thu', lessons: 0, assignments: 1 },
    { name: 'Fri', lessons: 3, assignments: 2 },
    { name: 'Sat', lessons: 4, assignments: 3 },
    { name: 'Sun', lessons: 2, assignments: 1 },
  ];

  const songs = data.recentSongs.map((s) => ({
    id: s.id,
    title: s.title,
    artist: s.artist,
    difficulty: 'Intermediate', // Mocked
    status: 'In Progress' as const, // Mocked
    progress: 50, // Mocked
  }));

  const assignments = data.assignments.map((a) => ({
    id: a.id,
    title: a.title,
    dueDate: a.due_date || 'No due date',
    status: (a.status === 'completed'
      ? 'Completed'
      : a.status === 'overdue'
      ? 'Overdue'
      : 'Pending') as 'Pending' | 'Completed' | 'Overdue',
  }));

  return (
    <div className="min-h-screen bg-background font-sans">
      <main className="container mx-auto px-4 py-8 max-w-7xl space-y-8">
        <div className="flex flex-col gap-2">
          <h1 className="text-3xl font-bold tracking-tight">Welcome back, Student!</h1>
          <p className="text-muted-foreground">
            Here&apos;s what&apos;s happening with your guitar journey.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          <StatCard
            title="Total Songs"
            value={data.stats.totalSongs.toString()}
            icon={Music}
            trend="+2 this week"
          />
          <StatCard
            title="Completed Lessons"
            value={data.stats.completedLessons.toString()}
            icon={BookOpen}
            trend="+1 this week"
          />
          <StatCard
            title="Active Assignments"
            value={data.stats.activeAssignments.toString()}
            icon={ClipboardList}
          />
          <StatCard
            title="Practice Hours"
            value={data.stats.practiceHours.toString()}
            icon={Clock}
            trend="+2.5h this week"
          />
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          <div className="lg:col-span-2 space-y-8">
            <ProgressChart data={chartData} />
            <SongLibrary songs={songs} />
          </div>
          <div className="space-y-8">
            <RecentActivity activities={activities} />
            <AssignmentList assignments={assignments} />
          </div>
        </div>
      </main>
    </div>
  );
}
