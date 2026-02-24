'use client';

import Link from 'next/link';
import { Badge } from '@/components/ui/badge';
import { Card, CardContent } from '@/components/ui/card';
import { BookOpen } from 'lucide-react';

export interface SongLesson {
  id: string;
  lesson_teacher_number: number;
  scheduled_at: string;
  status: string;
}

interface Props {
  lessons: SongLesson[];
}

export function StudentSongDetailLessons({ lessons }: Props) {
  if (lessons.length === 0) return null;

  return (
    <Card className="bg-card border-border/50 shadow-sm">
      <CardContent className="p-6">
        <div className="flex items-center gap-3 mb-4">
          <div className="p-2 bg-primary/10 rounded-full">
            <BookOpen className="w-5 h-5 text-primary" />
          </div>
          <h3 className="text-lg font-semibold">Your Lessons with this Song</h3>
        </div>
        <div className="space-y-2">
          {lessons.map((lesson) => (
            <Link
              key={lesson.id}
              href={`/dashboard/lessons/${lesson.id}`}
              className="flex items-center justify-between p-3 rounded-lg border border-border hover:bg-muted/50 transition-colors"
            >
              <div>
                <span className="font-medium text-sm">
                  Lesson #{lesson.lesson_teacher_number}
                </span>
                <span className="text-xs text-muted-foreground ml-2">
                  {new Date(lesson.scheduled_at).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })}
                </span>
              </div>
              <Badge variant="secondary" className="text-xs capitalize">
                {lesson.status?.toLowerCase().replace('_', ' ')}
              </Badge>
            </Link>
          ))}
        </div>
      </CardContent>
    </Card>
  );
}
