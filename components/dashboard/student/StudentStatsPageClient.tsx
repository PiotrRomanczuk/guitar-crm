'use client';

import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  PieChart,
  Pie,
  Cell,
} from 'recharts';
import { BookOpen, Music, ClipboardList, TrendingUp, Calendar, Award, Target } from 'lucide-react';
import { format } from 'date-fns';

interface StudentStatsPageClientProps {
  stats: {
    totalSongs: number;
    completedLessons: number;
    totalLessons: number;
    completedAssignments: number;
    totalAssignments: number;
    attendanceRate: number;
    assignmentCompletionRate: number;
    recentLessons: Array<{
      id: string;
      scheduled_at: string;
      status: string;
      notes: string | null;
      lesson_teacher_number: number;
    }>;
    songProgress: Array<{
      status: string;
      songs: {
        title: string;
        artist: string;
        level: string;
      } | null;
    }>;
  };
}

const COLORS = ['#0088FE', '#00C49F', '#FFBB28', '#FF8042', '#8884d8'];

export function StudentStatsPageClient({ stats }: StudentStatsPageClientProps) {
  // Process song progress data for charts
  const songStatusCounts = stats.songProgress.reduce((acc, item) => {
    if (!item.songs) return acc;
    const status = item.status || 'unknown';
    acc[status] = (acc[status] || 0) + 1;
    return acc;
  }, {} as Record<string, number>);

  const songProgressData = Object.entries(songStatusCounts).map(([status, count]) => ({
    name: status.replace('_', ' ').charAt(0).toUpperCase() + status.replace('_', ' ').slice(1),
    value: count,
  }));

  // Weekly lesson activity (mock data based on recent lessons)
  const weeklyActivity = Array.from({ length: 7 }, (_, i) => {
    const date = new Date();
    date.setDate(date.getDate() - (6 - i));
    const dayName = format(date, 'EEE');

    // Check if there are lessons on this day
    const lessonsOnDay = stats.recentLessons.filter((lesson) => {
      const lessonDate = new Date(lesson.scheduled_at);
      return lessonDate.toDateString() === date.toDateString();
    }).length;

    return {
      name: dayName,
      lessons: lessonsOnDay,
      practice: 45 + (i % 4) * 5, // Deterministic mock practice minutes (45-60)
    };
  });

  return (
    <div className="min-h-screen bg-background p-4 sm:p-8">
      <div
        className="mb-6 sm:mb-8 opacity-0 animate-fade-in"
        style={{ animationFillMode: 'forwards' }}
      >
        <h1 className="text-2xl sm:text-3xl font-bold tracking-tight mb-2">
          My Learning Statistics
        </h1>
        <p className="text-muted-foreground text-sm sm:text-base">
          Track your progress and achievements in your guitar journey
        </p>
      </div>

      {/* Key Metrics */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-6 mb-8">
        <Card
          className="opacity-0 animate-fade-in"
          style={{ animationDelay: '100ms', animationFillMode: 'forwards' }}
        >
          <CardContent className="p-4 sm:p-6">
            <div className="flex items-center space-x-2">
              <BookOpen className="w-5 h-5 text-primary" />
              <div className="space-y-1">
                <p className="text-sm text-muted-foreground">Lessons Completed</p>
                <p className="text-xl sm:text-2xl font-bold">{stats.completedLessons}</p>
                <p className="text-xs text-muted-foreground">of {stats.totalLessons} total</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card
          className="opacity-0 animate-fade-in"
          style={{ animationDelay: '200ms', animationFillMode: 'forwards' }}
        >
          <CardContent className="p-4 sm:p-6">
            <div className="flex items-center space-x-2">
              <Music className="w-5 h-5 text-primary" />
              <div className="space-y-1">
                <p className="text-sm text-muted-foreground">Songs Learning</p>
                <p className="text-xl sm:text-2xl font-bold">{stats.totalSongs}</p>
                <p className="text-xs text-muted-foreground">in repertoire</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card
          className="opacity-0 animate-fade-in"
          style={{ animationDelay: '300ms', animationFillMode: 'forwards' }}
        >
          <CardContent className="p-4 sm:p-6">
            <div className="flex items-center space-x-2">
              <Target className="w-5 h-5 text-primary" />
              <div className="space-y-1">
                <p className="text-sm text-muted-foreground">Attendance Rate</p>
                <p className="text-xl sm:text-2xl font-bold">{stats.attendanceRate}%</p>
                <Progress value={stats.attendanceRate} className="mt-2 h-1" />
              </div>
            </div>
          </CardContent>
        </Card>

        <Card
          className="opacity-0 animate-fade-in"
          style={{ animationDelay: '400ms', animationFillMode: 'forwards' }}
        >
          <CardContent className="p-4 sm:p-6">
            <div className="flex items-center space-x-2">
              <ClipboardList className="w-5 h-5 text-primary" />
              <div className="space-y-1">
                <p className="text-sm text-muted-foreground">Assignment Rate</p>
                <p className="text-xl sm:text-2xl font-bold">{stats.assignmentCompletionRate}%</p>
                <Progress value={stats.assignmentCompletionRate} className="mt-2 h-1" />
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 sm:gap-8">
        {/* Weekly Activity Chart */}
        <Card
          className="opacity-0 animate-fade-in"
          style={{ animationDelay: '500ms', animationFillMode: 'forwards' }}
        >
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <TrendingUp className="w-5 h-5" />
              Weekly Activity
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="h-[300px]">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={weeklyActivity}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="name" />
                  <YAxis />
                  <Tooltip />
                  <Bar dataKey="lessons" fill="#8884d8" name="Lessons" />
                  <Bar dataKey="practice" fill="#82ca9d" name="Practice (min)" />
                </BarChart>
              </ResponsiveContainer>
            </div>
          </CardContent>
        </Card>

        {/* Song Progress */}
        <Card
          className="opacity-0 animate-fade-in"
          style={{ animationDelay: '600ms', animationFillMode: 'forwards' }}
        >
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Music className="w-5 h-5" />
              Song Progress
            </CardTitle>
          </CardHeader>
          <CardContent>
            {songProgressData.length > 0 ? (
              <div className="h-[300px]">
                <ResponsiveContainer width="100%" height="100%">
                  <PieChart>
                    <Pie
                      data={songProgressData}
                      cx="50%"
                      cy="50%"
                      labelLine={false}
                      label={({ name, percent }) => `${name} ${((percent || 0) * 100).toFixed(0)}%`}
                      outerRadius={80}
                      fill="#8884d8"
                      dataKey="value"
                    >
                      {songProgressData.map((entry, index) => (
                        <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                      ))}
                    </Pie>
                    <Tooltip />
                  </PieChart>
                </ResponsiveContainer>
              </div>
            ) : (
              <div className="h-[300px] flex items-center justify-center text-muted-foreground">
                <p>No song progress data available yet</p>
              </div>
            )}
          </CardContent>
        </Card>

        {/* Recent Lessons */}
        <Card
          className="lg:col-span-2 opacity-0 animate-fade-in"
          style={{ animationDelay: '700ms', animationFillMode: 'forwards' }}
        >
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Calendar className="w-5 h-5" />
              Recent Lessons
            </CardTitle>
          </CardHeader>
          <CardContent>
            {stats.recentLessons.length > 0 ? (
              <div className="space-y-4">
                {stats.recentLessons.slice(0, 5).map((lesson) => (
                  <div
                    key={lesson.id}
                    className="flex items-center justify-between p-3 rounded-lg bg-muted/50"
                  >
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 rounded-lg bg-primary/10 flex items-center justify-center">
                        <BookOpen className="w-5 h-5 text-primary" />
                      </div>
                      <div>
                        <p className="font-medium">Lesson #{lesson.lesson_teacher_number}</p>
                        <p className="text-sm text-muted-foreground">
                          {format(new Date(lesson.scheduled_at), 'PPP')}
                        </p>
                      </div>
                    </div>
                    <Badge variant={lesson.status === 'COMPLETED' ? 'default' : 'secondary'}>
                      {lesson.status}
                    </Badge>
                  </div>
                ))}
              </div>
            ) : (
              <div className="text-center py-8 text-muted-foreground">
                <p>No recent lessons found</p>
              </div>
            )}
          </CardContent>
        </Card>
      </div>

      {/* Achievement Preview */}
      <Card
        className="mt-8 opacity-0 animate-fade-in"
        style={{ animationDelay: '800ms', animationFillMode: 'forwards' }}
      >
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Award className="w-5 h-5" />
            Achievements
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            <div className="text-center p-4 rounded-lg bg-muted/50">
              <div className="text-2xl mb-2">🎸</div>
              <p className="font-medium">First Strum</p>
              <p className="text-sm text-muted-foreground">
                {stats.completedLessons > 0 ? 'Completed!' : 'Complete your first lesson'}
              </p>
            </div>
            <div className="text-center p-4 rounded-lg bg-muted/50">
              <div className="text-2xl mb-2">📚</div>
              <p className="font-medium">Song Collector</p>
              <p className="text-sm text-muted-foreground">
                {stats.totalSongs >= 10 ? 'Completed!' : `${stats.totalSongs}/10 songs`}
              </p>
            </div>
            <div className="text-center p-4 rounded-lg bg-muted/50">
              <div className="text-2xl mb-2">⭐</div>
              <p className="font-medium">Star Student</p>
              <p className="text-sm text-muted-foreground">
                {stats.assignmentCompletionRate === 100
                  ? 'Completed!'
                  : `${stats.assignmentCompletionRate}% completion`}
              </p>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
