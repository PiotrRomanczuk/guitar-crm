'use client';

import Link from 'next/link';
import { BookOpen, Eye, EyeOff } from 'lucide-react';
import { Badge } from '@/components/ui/badge';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';

interface TheoryCourseCardProps {
  course: {
    id: string;
    title: string;
    description: string | null;
    level: string;
    is_published: boolean;
    lesson_count?: number;
  };
  isStaff: boolean;
}

const levelColors: Record<string, string> = {
  beginner: 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200',
  intermediate: 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-200',
  advanced: 'bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-200',
};

export function TheoryCourseCard({ course, isStaff }: TheoryCourseCardProps) {
  return (
    <Link href={`/dashboard/theory/${course.id}`}>
      <Card className="hover:shadow-md transition-shadow cursor-pointer h-full">
        <CardHeader className="pb-3">
          <div className="flex items-start justify-between gap-2">
            <CardTitle className="text-lg leading-tight">{course.title}</CardTitle>
            <div className="flex items-center gap-2 shrink-0">
              <Badge className={levelColors[course.level] ?? ''} variant="secondary">
                {course.level}
              </Badge>
              {isStaff && (
                course.is_published
                  ? <Eye className="size-4 text-green-600" />
                  : <EyeOff className="size-4 text-muted-foreground" />
              )}
            </div>
          </div>
        </CardHeader>
        <CardContent>
          {course.description && (
            <p className="text-sm text-muted-foreground line-clamp-2 mb-3">
              {course.description}
            </p>
          )}
          <div className="flex items-center gap-1 text-sm text-muted-foreground">
            <BookOpen className="size-4" />
            <span>
              {course.lesson_count ?? 0} {course.lesson_count === 1 ? 'chapter' : 'chapters'}
            </span>
          </div>
        </CardContent>
      </Card>
    </Link>
  );
}
