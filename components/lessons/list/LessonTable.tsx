'use client';

import Link from 'next/link';
import { Eye } from 'lucide-react';
import { LessonWithProfiles } from '@/schemas/LessonSchema';
import LessonTableRow from './LessonTable.Row';
import LessonTableEmpty from './LessonTable.Empty';
import { Table, TableBody, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { formatDate, formatTime, getStatusColor } from './LessonTable.helpers';

interface Props {
  lessons: LessonWithProfiles[];
  role: 'admin' | 'teacher' | 'student';
  baseUrl?: string; // e.g., '/dashboard/lessons', '/teacher/lessons', '/student/lessons'
}

export default function LessonTable({ lessons, role, baseUrl = '/dashboard/lessons' }: Props) {
  // Show actions column for admin and teacher only
  const showActions = role === 'admin' || role === 'teacher';

  // Show teacher column for admin and student (not for teacher viewing their own lessons)
  const showTeacherColumn = role === 'admin' || role === 'student';

  if (lessons.length === 0) {
    return <LessonTableEmpty role={role} />;
  }

  return (
    <>
      {/* Mobile View (Cards) */}
      <div className="md:hidden space-y-4">
        {lessons.map((lesson) => (
          <div key={lesson.id} className="bg-card rounded-xl border border-border p-4 space-y-3">
            <div className="flex justify-between items-start gap-3">
              <div className="min-w-0">
                <Link
                  href={`${baseUrl}/${lesson.id}`}
                  className="font-medium text-foreground hover:text-primary block truncate text-base"
                >
                  {lesson.title || 'Untitled Lesson'}
                </Link>
                <div className="text-sm text-muted-foreground mt-1">
                  {formatDate(lesson.date)} at {formatTime(lesson.start_time)}
                </div>
              </div>
              <Badge
                variant="outline"
                className={`font-medium flex-shrink-0 ${getStatusColor(lesson.status)}`}
              >
                {lesson.status || 'SCHEDULED'}
              </Badge>
            </div>

            <div className="text-sm space-y-1 pt-2 border-t border-border">
              <p className="truncate">
                <span className="text-muted-foreground">Student: </span>
                {lesson.profile
                  ? lesson.profile.full_name || lesson.profile.email
                  : 'Unknown Student'}
              </p>
              {showTeacherColumn && (
                <p className="truncate">
                  <span className="text-muted-foreground">Teacher: </span>
                  {lesson.teacher_profile
                    ? lesson.teacher_profile.full_name || lesson.teacher_profile.email
                    : 'Unknown Teacher'}
                </p>
              )}
            </div>

            {showActions && (
              <div className="pt-2 flex justify-end">
                <Button variant="ghost" size="sm" className="h-8" asChild>
                  <Link href={`${baseUrl}/${lesson.id}`}>
                    <Eye className="h-4 w-4 mr-1" />
                    View Details
                  </Link>
                </Button>
              </div>
            )}
          </div>
        ))}
      </div>

      {/* Desktop View (Table) */}
      <div
        className="hidden md:block bg-card rounded-xl border border-border overflow-hidden"
        data-testid="lesson-table"
      >
        <div className="overflow-x-auto">
          <Table className="min-w-[600px]">
            <TableHeader>
              <TableRow className="hover:bg-transparent border-border">
                <TableHead className="text-muted-foreground">Title</TableHead>
                <TableHead className="text-muted-foreground">Student</TableHead>
                {showTeacherColumn && (
                  <TableHead className="text-muted-foreground">Teacher</TableHead>
                )}
                <TableHead className="text-muted-foreground">Date</TableHead>
                <TableHead className="text-muted-foreground">Time</TableHead>
                <TableHead className="text-muted-foreground">Status</TableHead>
                {showActions && <TableHead className="text-muted-foreground">Actions</TableHead>}
              </TableRow>
            </TableHeader>
            <TableBody>
              {lessons.map((lesson) => (
                <LessonTableRow
                  key={lesson.id}
                  lesson={lesson}
                  showTeacherColumn={showTeacherColumn}
                  showActions={showActions}
                  baseUrl={baseUrl}
                />
              ))}
            </TableBody>
          </Table>
        </div>
      </div>
    </>
  );
}
