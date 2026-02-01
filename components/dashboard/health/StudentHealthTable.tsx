'use client';

import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Calendar, Mail, User } from 'lucide-react';
import Link from 'next/link';
import { getHealthStatusColor, HealthStatus } from '@/lib/utils/studentHealth';
import { formatDistanceToNow } from 'date-fns';

export interface StudentHealth {
  id: string;
  name: string;
  email: string;
  healthScore: number;
  healthStatus: HealthStatus;
  lastLesson: Date | null;
  lessonsThisMonth: number;
  overdueAssignments: number;
  recommendedAction: string;
}

interface StudentHealthTableProps {
  students: StudentHealth[];
  onSendMessage?: (studentId: string) => void;
}

export function StudentHealthTable({ students, onSendMessage }: StudentHealthTableProps) {
  if (students.length === 0) {
    return (
      <div className="text-center py-12 border rounded-lg">
        <User className="h-12 w-12 mx-auto text-muted-foreground mb-3" />
        <p className="text-sm text-muted-foreground">No student data available</p>
      </div>
    );
  }

  return (
    <div className="rounded-md border">
      <Table>
        <TableHeader>
          <TableRow>
            <TableHead>Student</TableHead>
            <TableHead>Health</TableHead>
            <TableHead>Last Lesson</TableHead>
            <TableHead>Lessons/Month</TableHead>
            <TableHead>Overdue</TableHead>
            <TableHead className="text-right">Actions</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {students.map((student) => {
            const healthColors = getHealthStatusColor(student.healthStatus);
            return (
              <TableRow key={student.id}>
                <TableCell className="font-medium">
                  <div>
                    <div>{student.name}</div>
                    <div className="text-xs text-muted-foreground">{student.email}</div>
                  </div>
                </TableCell>
                <TableCell>
                  <div className="flex items-center gap-2">
                    <span className="text-lg">{healthColors.emoji}</span>
                    <div>
                      <div className={`font-bold ${healthColors.text}`}>{student.healthScore}</div>
                      <div className="text-xs text-muted-foreground capitalize">
                        {student.healthStatus.replace('_', ' ')}
                      </div>
                    </div>
                  </div>
                </TableCell>
                <TableCell>
                  {student.lastLesson ? (
                    <div className="text-sm">
                      {formatDistanceToNow(new Date(student.lastLesson), { addSuffix: true })}
                    </div>
                  ) : (
                    <span className="text-xs text-muted-foreground">Never</span>
                  )}
                </TableCell>
                <TableCell>{student.lessonsThisMonth}</TableCell>
                <TableCell>
                  {student.overdueAssignments > 0 ? (
                    <Badge variant="destructive">{student.overdueAssignments}</Badge>
                  ) : (
                    <span className="text-xs text-muted-foreground">None</span>
                  )}
                </TableCell>
                <TableCell className="text-right">
                  <div className="flex justify-end gap-1">
                    <Link href={`/dashboard/lessons?student=${student.id}`}>
                      <Button
                        variant="ghost"
                        size="icon"
                        className="h-8 w-8"
                        title="Schedule Lesson"
                      >
                        <Calendar className="h-4 w-4" />
                      </Button>
                    </Link>
                    <Button
                      variant="ghost"
                      size="icon"
                      className="h-8 w-8"
                      title="Send Message"
                      onClick={() => onSendMessage?.(student.id)}
                    >
                      <Mail className="h-4 w-4" />
                    </Button>
                    <Link href={`/dashboard/users?id=${student.id}`}>
                      <Button variant="ghost" size="icon" className="h-8 w-8" title="View Profile">
                        <User className="h-4 w-4" />
                      </Button>
                    </Link>
                  </div>
                </TableCell>
              </TableRow>
            );
          })}
        </TableBody>
      </Table>
    </div>
  );
}
