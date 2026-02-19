'use client';

import { useState } from 'react';
import Link from 'next/link';
import { X, CheckCircle2, Circle, UserPlus, Calendar, Music } from 'lucide-react';
import { Progress } from '@/components/ui/progress';
import { Button } from '@/components/ui/button';
import { useDashboardStats, type TeacherStats } from '@/hooks/useDashboardStats';

interface ChecklistTask {
  id: string;
  label: string;
  ctaLabel: string;
  href: string;
  icon: React.ReactNode;
  isComplete: (stats: TeacherStats) => boolean;
}

const TASKS: ChecklistTask[] = [
  {
    id: 'add-student',
    label: 'Add your first student',
    ctaLabel: 'Add Student',
    href: '/dashboard/users/new',
    icon: <UserPlus className="h-4 w-4" />,
    isComplete: (s) => s.myStudents > 0,
  },
  {
    id: 'schedule-lesson',
    label: 'Schedule your first lesson',
    ctaLabel: 'Schedule Lesson',
    href: '/dashboard/lessons/new',
    icon: <Calendar className="h-4 w-4" />,
    isComplete: (s) => s.activeLessons > 0,
  },
  {
    id: 'add-song',
    label: 'Add a song to your library',
    ctaLabel: 'Add Song',
    href: '/dashboard/songs/new',
    icon: <Music className="h-4 w-4" />,
    isComplete: (s) => s.songsLibrary > 0,
  },
];

export function QuickStartChecklist() {
  const [isDismissed, setIsDismissed] = useState(() => {
    if (typeof window !== 'undefined') {
      return !!localStorage.getItem('quick-start-dismissed');
    }
    return true;
  });

  const { data } = useDashboardStats();
  const stats = data?.role === 'teacher' ? (data.stats as TeacherStats) : null;

  const handleDismiss = () => {
    localStorage.setItem('quick-start-dismissed', 'true');
    setIsDismissed(true);
  };

  if (isDismissed || !stats) return null;

  const items = TASKS.map((task) => ({
    ...task,
    completed: task.isComplete(stats),
  }));

  const completedCount = items.filter((i) => i.completed).length;
  const percentage = Math.round((completedCount / items.length) * 100);

  if (percentage === 100) return null;

  return (
    <div className="bg-linear-to-br from-primary/5 to-primary/10 rounded-lg border border-primary/20 p-6 space-y-4">
      <div className="flex items-start justify-between">
        <div>
          <h3 className="text-lg font-semibold text-foreground">Getting Started</h3>
          <p className="text-sm text-muted-foreground mt-1">
            Complete these steps to get the most out of Strummy
          </p>
        </div>
        <button
          onClick={handleDismiss}
          className="text-muted-foreground hover:text-foreground transition-colors"
          aria-label="Dismiss checklist"
        >
          <X className="h-5 w-5" />
        </button>
      </div>

      <div className="space-y-2">
        <div className="flex items-center justify-between text-sm">
          <span className="text-muted-foreground">Progress</span>
          <span className="font-semibold text-primary">{percentage}%</span>
        </div>
        <Progress value={percentage} className="h-2" />
      </div>

      <ul className="space-y-2">
        {items.map((item) => (
          <li key={item.id}>
            <div
              className={`flex items-center gap-3 p-3 rounded-lg transition-all ${
                item.completed
                  ? 'bg-success/10 border border-success/20'
                  : 'border border-border bg-background/50 dark:bg-background/20'
              }`}
            >
              <span className="shrink-0">
                {item.completed ? (
                  <CheckCircle2 className="h-5 w-5 text-success" />
                ) : (
                  <Circle className="h-5 w-5 text-muted-foreground" />
                )}
              </span>
              <span
                className={`text-sm flex-1 ${
                  item.completed ? 'text-success line-through' : 'text-foreground'
                }`}
              >
                {item.label}
              </span>
              {!item.completed && (
                <Button variant="outline" size="sm" asChild className="h-7 gap-1.5 text-xs">
                  <Link href={item.href}>
                    {item.icon}
                    {item.ctaLabel}
                  </Link>
                </Button>
              )}
            </div>
          </li>
        ))}
      </ul>

      <div className="bg-primary/10 rounded-lg p-3">
        <p className="text-xs text-primary dark:text-primary/90">
          <strong>Tip:</strong> Consistent practice 3-4 times per week yields the best results!
        </p>
      </div>
    </div>
  );
}
