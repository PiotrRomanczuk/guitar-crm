'use client';

import { useEffect, useState, useCallback } from 'react';
import { createClient } from '@/lib/supabase/client';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Clock, User, FileEdit, Music2, BookOpen, ClipboardList } from 'lucide-react';
import { format } from 'date-fns';
import Link from 'next/link';

interface LogEntry {
  id: string;
  type: 'assignment' | 'lesson' | 'song_status' | 'user';
  change_type?: string;
  previous_status?: string;
  new_status?: string;
  changed_at: string;
  changed_by?: string;
  student_id?: string;
  assignment_id?: string;
  lesson_id?: string;
  song_id?: string;
  user_id?: string;
  changer_profile?: {
    full_name: string | null;
    email: string;
  } | null;
  student_profile?: {
    full_name: string | null;
    email: string;
  } | null;
  assignment?: {
    title: string;
  } | null;
  lesson?: {
    lesson_teacher_number: number;
  } | null;
  song?: {
    title: string;
    author: string;
  } | null;
  user_profile?: {
    full_name: string | null;
    email: string;
    role: string;
  } | null;
}

const changeTypeColors: Record<string, string> = {
  created: 'bg-green-500/10 text-green-500 border-green-500/20',
  updated: 'bg-blue-500/10 text-blue-500 border-blue-500/20',
  status_changed: 'bg-yellow-500/10 text-yellow-500 border-yellow-500/20',
  deleted: 'bg-red-500/10 text-red-500 border-red-500/20',
  cancelled: 'bg-red-500/10 text-red-500 border-red-500/20',
  completed: 'bg-green-500/10 text-green-500 border-green-500/20',
  rescheduled: 'bg-purple-500/10 text-purple-500 border-purple-500/20',
  to_learn: 'bg-gray-500/10 text-gray-500 border-gray-500/20',
  learning: 'bg-blue-500/10 text-blue-500 border-blue-500/20',
  learned: 'bg-green-500/10 text-green-500 border-green-500/20',
  mastered: 'bg-purple-500/10 text-purple-500 border-purple-500/20',
  role_changed: 'bg-orange-500/10 text-orange-500 border-orange-500/20',
};

interface LogCardProps {
  log: LogEntry;
}

function LogCard({ log }: LogCardProps) {
  const getLogIcon = (type: string) => {
    switch (type) {
      case 'assignment':
        return <ClipboardList className="h-4 w-4" />;
      case 'lesson':
        return <BookOpen className="h-4 w-4" />;
      case 'song_status':
        return <Music2 className="h-4 w-4" />;
      case 'user':
        return <User className="h-4 w-4" />;
      default:
        return <FileEdit className="h-4 w-4" />;
    }
  };

  const getLogTitle = () => {
    switch (log.type) {
      case 'assignment':
        return log.assignment?.title || 'Assignment';
      case 'lesson':
        return `Lesson #${log.lesson?.lesson_teacher_number || 'N/A'}`;
      case 'song_status':
        return `${log.song?.title || 'Song'} - ${log.song?.author || 'Unknown'}`;
      case 'user':
        return log.user_profile?.full_name || log.user_profile?.email || 'User';
      default:
        return 'Unknown';
    }
  };

  const getLogLink = () => {
    switch (log.type) {
      case 'assignment':
        return `/dashboard/assignments/${log.assignment_id}`;
      case 'lesson':
        return `/dashboard/lessons/${log.lesson_id}`;
      case 'song_status':
        return `/dashboard/songs/${log.song_id}`;
      case 'user':
        return `/dashboard/users/${log.user_id}`;
      default:
        return '#';
    }
  };

  const getLogBadge = () => {
    if (log.type === 'song_status') {
      return (
        <div className="flex items-center gap-2">
          {log.previous_status && (
            <>
              <Badge variant="outline" className={changeTypeColors[log.previous_status]}>
                {log.previous_status}
              </Badge>
              <span className="text-muted-foreground">→</span>
            </>
          )}
          <Badge variant="outline" className={changeTypeColors[log.new_status || '']}>
            {log.new_status}
          </Badge>
        </div>
      );
    }

    return (
      <Badge variant="outline" className={changeTypeColors[log.change_type || '']}>
        {log.change_type?.replace(/_/g, ' ')}
      </Badge>
    );
  };

  return (
    <Card className="hover:bg-accent/50 transition-colors">
      <CardContent className="p-4">
        <div className="flex items-start gap-4">
          <div className="mt-1 rounded-full bg-primary/10 p-2">{getLogIcon(log.type)}</div>

          <div className="flex-1 min-w-0 space-y-2">
            <div className="flex items-start justify-between gap-4 flex-wrap">
              <div className="flex-1 min-w-0">
                <Link
                  href={getLogLink()}
                  className="font-medium hover:text-primary transition-colors block truncate"
                >
                  {getLogTitle()}
                </Link>
                <div className="flex items-center gap-2 mt-1 text-sm text-muted-foreground flex-wrap">
                  <Clock className="h-3 w-3" />
                  {format(new Date(log.changed_at), 'PPp')}
                  {(log.changer_profile || log.student_profile) && (
                    <>
                      <span>•</span>
                      <User className="h-3 w-3" />
                      {log.changer_profile
                        ? log.changer_profile.full_name || log.changer_profile.email
                        : log.student_profile?.full_name || log.student_profile?.email}
                    </>
                  )}
                </div>
              </div>
              {getLogBadge()}
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}

export function SystemLogs() {
  const [logs, setLogs] = useState<LogEntry[]>([]);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState<'all' | 'assignments' | 'lessons' | 'songs' | 'users'>(
    'all'
  );
  const [searchTerm, setSearchTerm] = useState('');
  const [filterUser, setFilterUser] = useState<string>('all');
  const [users, setUsers] = useState<{ id: string; name: string }[]>([]);

  const loadUsers = useCallback(async () => {
    try {
      const supabase = createClient();
      const { data } = await supabase
        .from('profiles')
        .select('id, full_name, email')
        .order('full_name');

      if (data) {
        setUsers(
          data.map((u) => ({
            id: u.id,
            name: u.full_name || u.email,
          }))
        );
      }
    } catch (err) {
      console.error('Error loading users:', err);
    }
  }, []);

  const loadLogs = useCallback(async () => {
    setLoading(true);
    try {
      const supabase = createClient();
      const allLogs: LogEntry[] = [];

      // Load assignment history
      if (activeTab === 'all' || activeTab === 'assignments') {
        const { data: assignmentLogs } = await supabase
          .from('assignment_history')
          .select(
            `
            id,
            change_type,
            changed_at,
            changed_by,
            assignment_id,
            changer_profile:profiles!assignment_history_changed_by_fkey(full_name, email),
            assignment:assignments(title)
          `
          )
          .order('changed_at', { ascending: false })
          .limit(100);

        if (assignmentLogs) {
          allLogs.push(
            ...assignmentLogs.map((log) => ({
              ...log,
              type: 'assignment' as const,
              changer_profile: Array.isArray(log.changer_profile)
                ? log.changer_profile[0] ?? null
                : log.changer_profile,
              assignment: Array.isArray(log.assignment)
                ? log.assignment[0] ?? null
                : log.assignment,
            }))
          );
        }
      }

      // Load lesson history
      if (activeTab === 'all' || activeTab === 'lessons') {
        const { data: lessonLogs } = await supabase
          .from('lesson_history')
          .select(
            `
            id,
            change_type,
            changed_at,
            changed_by,
            lesson_id,
            changer_profile:profiles!lesson_history_changed_by_fkey(full_name, email),
            lesson:lessons(lesson_teacher_number)
          `
          )
          .order('changed_at', { ascending: false })
          .limit(100);

        if (lessonLogs) {
          allLogs.push(
            ...lessonLogs.map((log) => ({
              ...log,
              type: 'lesson' as const,
              changer_profile: Array.isArray(log.changer_profile)
                ? log.changer_profile[0] ?? null
                : log.changer_profile,
              lesson: Array.isArray(log.lesson) ? log.lesson[0] ?? null : log.lesson,
            }))
          );
        }
      }

      // Load song status history
      if (activeTab === 'all' || activeTab === 'songs') {
        const { data: songLogs } = await supabase
          .from('song_status_history')
          .select(
            `
            id,
            previous_status,
            new_status,
            changed_at,
            student_id,
            song_id,
            student_profile:profiles!song_status_history_student_id_fkey(full_name, email),
            song:songs(title, author)
          `
          )
          .order('changed_at', { ascending: false })
          .limit(100);

        if (songLogs) {
          allLogs.push(
            ...songLogs.map((log) => ({
              ...log,
              type: 'song_status' as const,
              student_profile: Array.isArray(log.student_profile)
                ? log.student_profile[0] ?? null
                : log.student_profile,
              song: Array.isArray(log.song) ? log.song[0] ?? null : log.song,
            }))
          );
        }
      }

      // Load user history
      if (activeTab === 'all' || activeTab === 'users') {
        const { data: userLogs } = await supabase
          .from('user_history')
          .select(
            `
            id,
            change_type,
            changed_at,
            changed_by,
            user_id,
            changer_profile:profiles!user_history_changed_by_fkey(full_name, email),
            user_profile:profiles!user_history_user_id_fkey(full_name, email, role)
          `
          )
          .order('changed_at', { ascending: false })
          .limit(100);

        if (userLogs) {
          allLogs.push(
            ...userLogs.map((log) => ({
              ...log,
              type: 'user' as const,
              changer_profile: Array.isArray(log.changer_profile)
                ? log.changer_profile[0] ?? null
                : log.changer_profile,
              user_profile: Array.isArray(log.user_profile)
                ? log.user_profile[0] ?? null
                : log.user_profile,
            }))
          );
        }
      }

      // Sort all logs by date
      allLogs.sort((a, b) => new Date(b.changed_at).getTime() - new Date(a.changed_at).getTime());

      setLogs(allLogs);
    } catch (err) {
      console.error('Error loading logs:', err);
    } finally {
      setLoading(false);
    }
  }, [activeTab]);

  useEffect(() => {
    loadLogs();
    loadUsers();
  }, [loadLogs, loadUsers]);

  const filteredLogs = logs.filter((log) => {
    // Filter by user
    if (filterUser !== 'all') {
      const userId = log.changed_by || log.student_id;
      if (userId !== filterUser) return false;
    }

    // Filter by search term
    if (searchTerm) {
      const searchLower = searchTerm.toLowerCase();
      const matchesAssignment = log.assignment?.title?.toLowerCase().includes(searchLower);
      const matchesLesson = log.lesson?.lesson_teacher_number?.toString().includes(searchLower);
      const matchesSong =
        log.song?.title?.toLowerCase().includes(searchLower) ||
        log.song?.author?.toLowerCase().includes(searchLower);
      const matchesUserProfile =
        log.user_profile?.full_name?.toLowerCase().includes(searchLower) ||
        log.user_profile?.email?.toLowerCase().includes(searchLower);
      const matchesUser =
        log.changer_profile?.full_name?.toLowerCase().includes(searchLower) ||
        log.changer_profile?.email?.toLowerCase().includes(searchLower) ||
        log.student_profile?.full_name?.toLowerCase().includes(searchLower) ||
        log.student_profile?.email?.toLowerCase().includes(searchLower);

      if (
        !matchesAssignment &&
        !matchesLesson &&
        !matchesSong &&
        !matchesUserProfile &&
        !matchesUser
      ) {
        return false;
      }
    }

    return true;
  });

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold">System Activity Logs</h1>
        <p className="text-muted-foreground mt-2">
          View all changes across assignments, lessons, song progress, and user profiles
        </p>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Filters</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="search">Search</Label>
              <Input
                id="search"
                placeholder="Search by name, title, user..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="user">Filter by User</Label>
              <Select value={filterUser} onValueChange={setFilterUser}>
                <SelectTrigger id="user">
                  <SelectValue placeholder="All users" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All users</SelectItem>
                  {users.map((user) => (
                    <SelectItem key={user.id} value={user.id}>
                      {user.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </div>
        </CardContent>
      </Card>

      <Tabs value={activeTab} onValueChange={(v) => setActiveTab(v as typeof activeTab)}>
        <TabsList className="grid w-full grid-cols-5">
          <TabsTrigger value="all">All Logs</TabsTrigger>
          <TabsTrigger value="assignments">Assignments</TabsTrigger>
          <TabsTrigger value="lessons">Lessons</TabsTrigger>
          <TabsTrigger value="songs">Song Progress</TabsTrigger>
          <TabsTrigger value="users">Users</TabsTrigger>
        </TabsList>

        <TabsContent value={activeTab} className="space-y-4 mt-6">
          {loading ? (
            <Card>
              <CardContent className="py-12">
                <div className="flex items-center justify-center">
                  <div className="h-8 w-8 animate-spin rounded-full border-4 border-primary border-t-transparent" />
                </div>
              </CardContent>
            </Card>
          ) : filteredLogs.length === 0 ? (
            <Card>
              <CardContent className="py-12">
                <p className="text-center text-muted-foreground">No logs found</p>
              </CardContent>
            </Card>
          ) : (
            <div className="space-y-3">
              {filteredLogs.map((log) => (
                <LogCard key={`${log.type}-${log.id}`} log={log} />
              ))}
            </div>
          )}
        </TabsContent>
      </Tabs>
    </div>
  );
}
