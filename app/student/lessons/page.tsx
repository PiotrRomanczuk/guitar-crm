'use client';

import { useState } from 'react';
import { Badge } from '@/components/ui/badge';
import { Calendar, Clock, User, BookOpen } from 'lucide-react';
import { cn } from '@/lib/utils';
import { format } from 'date-fns';

interface LessonWithDetails {
  id: string;
  scheduled_at: string;
  status: string;
  notes: string | null;
  lesson_teacher_number: number;
  teacher: { full_name: string | null; email: string } | null;
  student: { full_name: string | null; email: string } | null;
}

const statusColors: Record<string, string> = {
  SCHEDULED: 'bg-primary/10 text-primary border-primary/20',
  IN_PROGRESS: 'bg-yellow-500/10 text-yellow-500 border-yellow-500/20',
  COMPLETED: 'bg-green-500/10 text-green-500 border-green-500/20',
  CANCELLED: 'bg-destructive/10 text-destructive border-destructive/20',
  RESCHEDULED: 'bg-muted text-muted-foreground border-border',
};

const statusLabels: Record<string, string> = {
  SCHEDULED: 'Scheduled',
  IN_PROGRESS: 'In Progress',
  COMPLETED: 'Completed',
  CANCELLED: 'Cancelled',
  RESCHEDULED: 'Rescheduled',
};

const dummyLessons: LessonWithDetails[] = [
  {
    id: '1',
    scheduled_at: new Date(Date.now() + 2 * 24 * 60 * 60 * 1000).toISOString(),
    status: 'SCHEDULED',
    notes: 'Focus on chord transitions and strumming patterns',
    lesson_teacher_number: 12,
    teacher: { full_name: 'John Smith', email: 'john@example.com' },
    student: { full_name: 'Emma Wilson', email: 'emma@example.com' },
  },
  {
    id: '2',
    scheduled_at: new Date().toISOString(),
    status: 'IN_PROGRESS',
    notes: 'Working on fingerpicking technique for Blackbird',
    lesson_teacher_number: 11,
    teacher: { full_name: 'John Smith', email: 'john@example.com' },
    student: { full_name: 'Michael Brown', email: 'michael@example.com' },
  },
  {
    id: '3',
    scheduled_at: new Date(Date.now() - 3 * 24 * 60 * 60 * 1000).toISOString(),
    status: 'COMPLETED',
    notes: 'Great progress on barre chords! Ready to move to intermediate songs.',
    lesson_teacher_number: 10,
    teacher: { full_name: 'Sarah Johnson', email: 'sarah@example.com' },
    student: { full_name: 'Emma Wilson', email: 'emma@example.com' },
  },
  {
    id: '4',
    scheduled_at: new Date(Date.now() - 7 * 24 * 60 * 60 * 1000).toISOString(),
    status: 'COMPLETED',
    notes: null,
    lesson_teacher_number: 9,
    teacher: { full_name: 'John Smith', email: 'john@example.com' },
    student: { full_name: 'James Davis', email: 'james@example.com' },
  },
  {
    id: '5',
    scheduled_at: new Date(Date.now() - 10 * 24 * 60 * 60 * 1000).toISOString(),
    status: 'CANCELLED',
    notes: 'Student was sick - rescheduling for next week',
    lesson_teacher_number: 8,
    teacher: { full_name: 'Sarah Johnson', email: 'sarah@example.com' },
    student: { full_name: 'Olivia Martinez', email: 'olivia@example.com' },
  },
];

export default function LessonsPage() {
  const [lessons] = useState<LessonWithDetails[]>(dummyLessons);

  return (
    <div className="min-h-screen bg-background p-8">
      <div className="mb-8 opacity-0 animate-fade-in" style={{ animationFillMode: 'forwards' }}>
        <h1 className="text-3xl font-semibold">
          <span className="text-primary">Lessons</span>
        </h1>
        <p className="text-muted-foreground mt-1">View and manage all scheduled lessons</p>
      </div>

      <div className="space-y-4">
        {lessons.map((lesson, index) => (
          <div
            key={lesson.id}
            className="bg-card rounded-xl border border-border p-6 hover:border-primary/30 transition-all duration-300 opacity-0 animate-fade-in"
            style={{ animationDelay: `${index * 100}ms`, animationFillMode: 'forwards' }}
          >
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
              <div className="flex items-start gap-4">
                <div className="w-12 h-12 rounded-lg bg-primary/10 flex items-center justify-center flex-shrink-0">
                  <BookOpen className="w-6 h-6 text-primary" />
                </div>

                <div>
                  <div className="flex items-center gap-3 mb-1">
                    <h3 className="font-semibold text-lg">
                      Lesson #{lesson.lesson_teacher_number}
                    </h3>
                    <Badge variant="outline" className={cn(statusColors[lesson.status])}>
                      {statusLabels[lesson.status]}
                    </Badge>
                  </div>

                  <div className="flex flex-wrap gap-4 text-sm text-muted-foreground">
                    <div className="flex items-center gap-1">
                      <Calendar className="w-4 h-4" />
                      {format(new Date(lesson.scheduled_at), 'MMMM d, yyyy')}
                    </div>
                    <div className="flex items-center gap-1">
                      <Clock className="w-4 h-4" />
                      {format(new Date(lesson.scheduled_at), 'h:mm a')}
                    </div>
                    <div className="flex items-center gap-1">
                      <User className="w-4 h-4" />
                      {lesson.teacher?.full_name || 'Unknown Teacher'}
                    </div>
                  </div>
                </div>
              </div>

              {lesson.notes && (
                <div className="md:max-w-md bg-secondary/30 rounded-lg p-3 text-sm">
                  <p className="text-muted-foreground italic">&quot;{lesson.notes}&quot;</p>
                </div>
              )}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
