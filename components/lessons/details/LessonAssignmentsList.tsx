import Link from 'next/link';
import { Database } from '@/database.types';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import { Badge } from '@/components/ui/badge';
import { AddAssignmentDialog } from './AddAssignmentDialog';

interface Assignment {
  id: string;
  title: string;
  status: Database['public']['Enums']['assignment_status'];
  due_date: string | null;
}

interface LessonAssignmentsListProps {
  lessonId: string;
  studentId: string;
  teacherId: string;
  assignments: Assignment[];
  canEdit: boolean;
}

export function LessonAssignmentsList({
  lessonId,
  studentId,
  teacherId,
  assignments,
  canEdit,
}: LessonAssignmentsListProps) {
  return (
    <Card>
      <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
        <CardTitle className="text-xl font-bold">Assignments</CardTitle>
        {canEdit && (
          <AddAssignmentDialog lessonId={lessonId} studentId={studentId} teacherId={teacherId} />
        )}
      </CardHeader>
      <CardContent>
        {assignments && assignments.length > 0 ? (
          <div className="rounded-md border">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Title</TableHead>
                  <TableHead>Due Date</TableHead>
                  <TableHead>Status</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {assignments.map((assignment) => (
                  <TableRow key={assignment.id}>
                    <TableCell>
                      <Link
                        href={`/dashboard/assignments/${assignment.id}`}
                        className="font-medium text-blue-600 hover:underline dark:text-blue-400"
                      >
                        {assignment.title}
                      </Link>
                    </TableCell>
                    <TableCell>
                      {assignment.due_date
                        ? new Date(assignment.due_date).toLocaleDateString()
                        : '-'}
                    </TableCell>
                    <TableCell>
                      <Badge
                        variant={
                          assignment.status === 'completed'
                            ? 'default' // Green-ish usually, or use custom class if needed. Default is primary.
                            : assignment.status === 'in_progress'
                            ? 'secondary'
                            : 'outline'
                        }
                        className={
                          assignment.status === 'completed'
                            ? 'bg-green-100 text-green-800 hover:bg-green-100/80 dark:bg-green-900 dark:text-green-300'
                            : assignment.status === 'in_progress'
                            ? 'bg-blue-100 text-blue-800 hover:bg-blue-100/80 dark:bg-blue-900 dark:text-blue-300'
                            : ''
                        }
                      >
                        {assignment.status}
                      </Badge>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </div>
        ) : (
          <p className="text-muted-foreground text-sm">No assignments for this lesson.</p>
        )}
      </CardContent>
    </Card>
  );
}
