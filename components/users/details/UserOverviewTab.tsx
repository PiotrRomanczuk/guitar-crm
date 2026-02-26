'use client';

import Link from 'next/link';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Music, BookOpen, CheckCircle2, Calendar, Plus, Users } from 'lucide-react';
import type { StudentRepertoireWithSong } from '@/types/StudentRepertoire';

interface Lesson {
  id: string;
  lesson_teacher_number: number | null;
  status: string | null;
  date: string | null;
}

interface Assignment {
  id: string;
  title: string | null;
  status: string | null;
  due_date: string | null;
}

interface ParentInfo {
  id: string;
  full_name: string | null;
  email: string;
}

interface UserOverviewTabProps {
  userId: string;
  lessons: Lesson[];
  repertoire: StudentRepertoireWithSong[];
  assignments: Assignment[];
  parentProfile?: ParentInfo | null;
}

function StatCard({ icon, label, value }: { icon: React.ReactNode; label: string; value: number }) {
  return (
    <Card>
      <CardContent className="p-4 flex items-center gap-3">
        <div className="p-2 rounded-lg bg-muted">{icon}</div>
        <div>
          <p className="text-2xl font-bold">{value}</p>
          <p className="text-xs text-muted-foreground">{label}</p>
        </div>
      </CardContent>
    </Card>
  );
}

export default function UserOverviewTab({ userId, lessons, repertoire, assignments, parentProfile }: UserOverviewTabProps) {
  const totalLessons = lessons.length;
  const totalSongs = repertoire.length;
  const masteredSongs = repertoire.filter((r) => r.current_status === 'mastered').length;
  const activeSongs = repertoire.filter((r) => r.is_active).slice(0, 5);
  const upcomingLessons = lessons
    .filter((l) => l.status === 'SCHEDULED')
    .sort((a, b) => new Date(a.date || 0).getTime() - new Date(b.date || 0).getTime())
    .slice(0, 3);
  const activeAssignments = assignments
    .filter((a) => a.status !== 'completed' && a.status !== 'cancelled')
    .slice(0, 3);

  return (
    <div className="space-y-6">
      {/* Stats Row */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <StatCard icon={<BookOpen className="h-5 w-5 text-blue-500" />} label="Total Lessons" value={totalLessons} />
        <StatCard icon={<Music className="h-5 w-5 text-purple-500" />} label="Songs" value={totalSongs} />
        <StatCard icon={<CheckCircle2 className="h-5 w-5 text-green-500" />} label="Mastered" value={masteredSongs} />
        <StatCard icon={<Calendar className="h-5 w-5 text-orange-500" />} label="Upcoming" value={upcomingLessons.length} />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Upcoming Lessons */}
        <Card>
          <CardHeader className="pb-3">
            <div className="flex items-center justify-between">
              <CardTitle className="text-base">Upcoming Lessons</CardTitle>
              <Link href={`/dashboard/users/${userId}?tab=lessons`}>
                <Button variant="ghost" size="sm" className="text-xs">
                  View all
                </Button>
              </Link>
            </div>
          </CardHeader>
          <CardContent className="pt-0">
            {upcomingLessons.length > 0 ? (
              <div className="space-y-2">
                {upcomingLessons.map((lesson) => (
                  <Link
                    key={lesson.id}
                    href={`/dashboard/lessons/${lesson.id}`}
                    className="flex items-center justify-between p-2 rounded-lg hover:bg-muted/50 transition-colors"
                  >
                    <div className="flex items-center gap-2">
                      <span className="text-sm font-medium text-muted-foreground">
                        #{lesson.lesson_teacher_number}
                      </span>
                      <span className="text-sm">
                        {lesson.date
                          ? new Date(lesson.date).toLocaleDateString('en-US', {
                              weekday: 'short',
                              month: 'short',
                              day: 'numeric',
                            })
                          : 'No date'}
                      </span>
                    </div>
                    <Badge variant="outline" className="text-xs bg-primary/5 text-primary">
                      Scheduled
                    </Badge>
                  </Link>
                ))}
              </div>
            ) : (
              <p className="text-sm text-muted-foreground text-center py-4">No upcoming lessons</p>
            )}
          </CardContent>
        </Card>

        {/* Active Songs */}
        <Card>
          <CardHeader className="pb-3">
            <div className="flex items-center justify-between">
              <CardTitle className="text-base">Active Songs</CardTitle>
              <Link href={`/dashboard/users/${userId}?tab=repertoire`}>
                <Button variant="ghost" size="sm" className="text-xs">
                  View all
                </Button>
              </Link>
            </div>
          </CardHeader>
          <CardContent className="pt-0">
            {activeSongs.length > 0 ? (
              <div className="space-y-2">
                {activeSongs.map((item) => (
                  <div key={item.id} className="flex items-center justify-between p-2 rounded-lg hover:bg-muted/50">
                    <div className="min-w-0 flex-1">
                      <p className="text-sm font-medium truncate">{item.song.title}</p>
                      <p className="text-xs text-muted-foreground truncate">{item.song.author}</p>
                    </div>
                    <Badge variant="secondary" className="text-xs capitalize ml-2">
                      {item.current_status.replace('_', ' ')}
                    </Badge>
                  </div>
                ))}
              </div>
            ) : (
              <div className="text-center py-4">
                <p className="text-sm text-muted-foreground">No songs in repertoire</p>
                <Link href={`/dashboard/users/${userId}?tab=repertoire`}>
                  <Button variant="outline" size="sm" className="mt-2 gap-1">
                    <Plus className="h-3 w-3" />
                    Add Song
                  </Button>
                </Link>
              </div>
            )}
          </CardContent>
        </Card>
      </div>

      {/* Recent Assignments */}
      {activeAssignments.length > 0 && (
        <Card>
          <CardHeader className="pb-3">
            <div className="flex items-center justify-between">
              <CardTitle className="text-base">Active Assignments</CardTitle>
              <Link href={`/dashboard/users/${userId}?tab=assignments`}>
                <Button variant="ghost" size="sm" className="text-xs">
                  View all
                </Button>
              </Link>
            </div>
          </CardHeader>
          <CardContent className="pt-0">
            <div className="space-y-2">
              {activeAssignments.map((assignment) => (
                <div key={assignment.id} className="flex items-center justify-between p-2 rounded-lg hover:bg-muted/50">
                  <span className="text-sm truncate">{assignment.title || 'Untitled'}</span>
                  <Badge variant="outline" className="text-xs capitalize ml-2">
                    {(assignment.status || 'pending').replace('_', ' ')}
                  </Badge>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      )}

      {/* Parent / Guardian card */}
      {parentProfile && (
        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-base flex items-center gap-2">
              <Users className="h-4 w-4 text-muted-foreground" />
              Parent / Guardian
            </CardTitle>
          </CardHeader>
          <CardContent className="pt-0">
            <div className="flex items-center justify-between p-2 rounded-lg hover:bg-muted/50">
              <div>
                <p className="text-sm font-medium">{parentProfile.full_name || parentProfile.email}</p>
                <p className="text-xs text-muted-foreground">{parentProfile.email}</p>
              </div>
              <Link href={`/dashboard/users/${parentProfile.id}`}>
                <Button variant="ghost" size="sm" className="text-xs">View Profile</Button>
              </Link>
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
}
