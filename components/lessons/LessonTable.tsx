'use client';

import { Table, TableBody, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { LessonWithProfiles } from '@/schemas/LessonSchema';
import LessonTableRow from './LessonTable.Row';
import LessonTableEmpty from './LessonTable.Empty';

interface Props {
  lessons: LessonWithProfiles[];
  role: 'admin' | 'teacher' | 'student';
  baseUrl: string;
}

export default function LessonTable({ lessons, role, baseUrl }: Props) {
  if (!lessons || lessons.length === 0) {
    return <LessonTableEmpty role={role} />;
  }

  const showTeacherColumn = role === 'admin' || role === 'student';
  const showActions = role === 'admin' || role === 'teacher';

  return (
    <div className="overflow-x-auto rounded-md border">
      <Table>
        <TableHeader>
          <TableRow>
            <TableHead>Student</TableHead>
            {showTeacherColumn && <TableHead>Teacher</TableHead>}
            <TableHead>Date</TableHead>
            <TableHead>Time</TableHead>
            <TableHead>Title</TableHead>
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
