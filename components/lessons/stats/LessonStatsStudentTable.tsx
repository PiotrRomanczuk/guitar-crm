'use client';

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import { Badge } from '@/components/ui/badge';
import type { AdvancedLessonStats } from '../hooks/useLessonStatsAdvanced';

interface Props {
  students: AdvancedLessonStats['studentLeaderboard'];
}

function formatDate(dateStr: string) {
  return new Date(dateStr).toLocaleDateString('en-US', {
    month: 'short',
    year: 'numeric',
  });
}

export function LessonStatsStudentTable({ students }: Props) {
  return (
    <Card>
      <CardHeader>
        <CardTitle>Top Students</CardTitle>
        <CardDescription>Students ranked by total lessons taken</CardDescription>
      </CardHeader>
      <CardContent>
        <div className="overflow-x-auto">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead className="w-[50px]">#</TableHead>
                <TableHead>Student</TableHead>
                <TableHead className="text-right">Lessons</TableHead>
                <TableHead className="hidden sm:table-cell">First</TableHead>
                <TableHead className="hidden sm:table-cell">Last</TableHead>
                <TableHead className="text-right">Active Span</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {students.map((student, i) => (
                <TableRow key={student.email || i}>
                  <TableCell className="font-medium text-muted-foreground">{i + 1}</TableCell>
                  <TableCell>
                    <div className="flex flex-col">
                      <span className="font-medium">{student.name}</span>
                      <span className="text-xs text-muted-foreground">{student.email}</span>
                    </div>
                  </TableCell>
                  <TableCell className="text-right">
                    <Badge variant="secondary">{student.totalLessons}</Badge>
                  </TableCell>
                  <TableCell className="hidden sm:table-cell text-muted-foreground text-sm">
                    {formatDate(student.firstLesson)}
                  </TableCell>
                  <TableCell className="hidden sm:table-cell text-muted-foreground text-sm">
                    {formatDate(student.lastLesson)}
                  </TableCell>
                  <TableCell className="text-right text-sm">
                    {student.activeSpanMonths} mo
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </div>
      </CardContent>
    </Card>
  );
}
