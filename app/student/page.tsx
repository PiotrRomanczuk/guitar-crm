'use client';

import { StatCard } from '@/components/student/dashboard/StatCard';
import { RecentActivity } from '@/components/student/dashboard/RecentActivity';
import { ProgressChart } from '@/components/student/dashboard/ProgressChart';
import { SongLibrary } from '@/components/student/songs/SongLibrary';
import { AssignmentList } from '@/components/student/assignments/AssignmentList';
import { Music, BookOpen, ClipboardList, Clock } from 'lucide-react';

// Mock data for Student Dashboard
const activities = [
  {
    id: '1',
    type: 'lesson_completed' as const,
    message: "You completed 'Blues Basics' lesson",
    time: '2 hours ago',
  },
  {
    id: '2',
    type: 'assignment_submitted' as const,
    message: "You submitted 'G Major Scale' practice",
    time: '4 hours ago',
  },
  {
    id: '3',
    type: 'song_added' as const,
    message: "New song added to your library: 'Hotel California'",
    time: 'Yesterday',
  },
  {
    id: '4',
    type: 'assignment_due' as const,
    message: "Assignment 'Fingerpicking' is due tomorrow",
    time: 'Reminder',
  },
];

const chartData = [
  { name: 'Mon', lessons: 1, assignments: 1 },
  { name: 'Tue', lessons: 2, assignments: 0 },
  { name: 'Wed', lessons: 1, assignments: 2 },
  { name: 'Thu', lessons: 0, assignments: 1 },
  { name: 'Fri', lessons: 3, assignments: 2 },
  { name: 'Sat', lessons: 4, assignments: 3 },
  { name: 'Sun', lessons: 2, assignments: 1 },
];

const mySongs = [
  {
    id: '1',
    title: 'Wonderwall',
    artist: 'Oasis',
    difficulty: 'Easy' as const,
    duration: '4:18',
    studentsLearning: 120,
  },
  {
    id: '2',
    title: 'Blackbird',
    artist: 'The Beatles',
    difficulty: 'Medium' as const,
    duration: '2:18',
    studentsLearning: 85,
  },
  {
    id: '3',
    title: 'Tears in Heaven',
    artist: 'Eric Clapton',
    difficulty: 'Medium' as const,
    duration: '4:33',
    studentsLearning: 64,
  },
];

const myAssignments = [
  {
    id: '1',
    title: 'Practice G Major Scale',
    studentName: 'Me',
    dueDate: 'Dec 12',
    status: 'pending' as const,
  },
  {
    id: '2',
    title: 'Learn Intro Riff',
    studentName: 'Me',
    dueDate: 'Dec 11',
    status: 'submitted' as const,
    songTitle: 'Smoke on the Water',
  },
  {
    id: '3',
    title: 'Chord Transitions Exercise',
    studentName: 'Me',
    dueDate: 'Dec 10',
    status: 'overdue' as const,
  },
];

export default function StudentDashboard() {
  return (
    <div className="min-h-screen bg-background p-8">
      {/* Header */}
      <div className="mb-8 opacity-0 animate-fade-in" style={{ animationFillMode: 'forwards' }}>
        <h1 className="text-3xl font-semibold">
          Welcome back, <span className="text-primary">Student</span>
        </h1>
        <p className="text-muted-foreground mt-1">Here&apos;s your progress overview.</p>
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
        <StatCard
          title="My Songs"
          value={12}
          change="+2 this month"
          changeType="positive"
          icon={Music}
          delay={50}
        />
        <StatCard
          title="Lessons Completed"
          value={24}
          change="+4 this week"
          changeType="positive"
          icon={BookOpen}
          delay={100}
        />
        <StatCard
          title="Practice Hours"
          value="18h"
          change="+2.5h from last week"
          changeType="positive"
          icon={Clock}
          delay={150}
        />
        <StatCard
          title="Pending Assignments"
          value={3}
          change="1 due today"
          changeType="neutral"
          icon={ClipboardList}
          delay={200}
        />
      </div>

      {/* Charts & Activity */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mb-8">
        <div className="lg:col-span-2">
          <ProgressChart data={chartData} />
        </div>
        <div>
          <RecentActivity activities={activities} />
        </div>
      </div>

      {/* Lists */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <AssignmentList assignments={myAssignments} />
        <SongLibrary songs={mySongs} />
      </div>
    </div>
  );
}
