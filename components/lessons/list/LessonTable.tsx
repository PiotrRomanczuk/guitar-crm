'use client';

import { LessonWithProfiles } from '@/schemas/LessonSchema';
import LessonTableRow from './LessonTable.Row';
import LessonTableEmpty from './LessonTable.Empty';
import { Table, TableBody, TableHead, TableHeader, TableRow } from '@/components/ui/table';

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
    <div
      className="bg-card rounded-xl border border-border overflow-hidden"
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
  );
}
