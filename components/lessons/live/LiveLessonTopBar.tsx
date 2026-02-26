'use client';

import Link from 'next/link';
import { Button } from '@/components/ui/button';
import { ArrowLeft, CircleStop } from 'lucide-react';

interface LiveLessonTopBarProps {
  lessonId: string;
  studentName: string;
  lessonDate: string;
  isCompleted: boolean;
}

function formatLessonDate(dateStr: string): string {
  try {
    return new Date(dateStr).toLocaleDateString(undefined, {
      weekday: 'short',
      month: 'short',
      day: 'numeric',
    });
  } catch {
    return 'Unknown date';
  }
}

export function LiveLessonTopBar({
  lessonId,
  studentName,
  lessonDate,
  isCompleted,
}: LiveLessonTopBarProps) {
  return (
    <header className="sticky top-0 z-40 bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60 border-b">
      <div className="flex items-center justify-between px-4 py-3 max-w-3xl mx-auto">
        <div className="flex items-center gap-3 min-w-0">
          <Button variant="ghost" size="icon-sm" asChild>
            <Link href={`/dashboard/lessons/${lessonId}`} aria-label="Back to lesson details">
              <ArrowLeft className="size-5" />
            </Link>
          </Button>
          <div className="min-w-0">
            <p className="font-semibold text-foreground truncate text-sm sm:text-base">
              {studentName}
            </p>
            <p className="text-xs text-muted-foreground">{formatLessonDate(lessonDate)}</p>
          </div>
        </div>

        <Button variant="destructive" size="sm" className="gap-1.5 shrink-0" asChild>
          <Link href={`/dashboard/lessons/${lessonId}`}>
            <CircleStop className="size-4" />
            <span className="hidden sm:inline">
              {isCompleted ? 'Close Review' : 'End Lesson'}
            </span>
          </Link>
        </Button>
      </div>
    </header>
  );
}
