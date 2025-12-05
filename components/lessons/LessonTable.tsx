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
    <div className="rounded-md border" data-testid="lesson-table">
      <Table>
        <TableHeader>
          <TableRow>
            <TableHead>Title</TableHead>
            <TableHead>Student</TableHead>
            {showTeacherColumn && <TableHead>Teacher</TableHead>}
            <TableHead>Date</TableHead>
            <TableHead>Time</TableHead>
            <TableHead>Status</TableHead>
            {showActions && <TableHead>Actions</TableHead>}
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
  );
}
