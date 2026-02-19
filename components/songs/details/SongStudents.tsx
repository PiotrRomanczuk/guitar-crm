'use client';

import { SongStudentItem } from '@/app/dashboard/songs/[id]/actions';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import Link from 'next/link';

type Props = {
  students: SongStudentItem[];
};

const STATUS_GROUPS = {
  Mastered: ['mastered'],
  'In Progress': ['started', 'remembered', 'with_author'],
  'To Learn': ['to_learn'],
};

const STATUS_COLORS: Record<string, string> = {
  mastered: 'bg-success hover:bg-success/90',
  started: 'bg-primary hover:bg-primary/90',
  remembered: 'bg-warning hover:bg-warning/90',
  with_author: 'bg-primary hover:bg-primary/90',
  to_learn: 'bg-muted-foreground hover:bg-muted-foreground/90',
};

export function SongStudents({ students }: Props) {
  const groupedStudents = {
    Mastered: students.filter((item) => STATUS_GROUPS.Mastered.includes(item.status)),
    'In Progress': students.filter((item) => STATUS_GROUPS['In Progress'].includes(item.status)),
    'To Learn': students.filter((item) => STATUS_GROUPS['To Learn'].includes(item.status)),
  };

  return (
    <div className="space-y-6">
      {(Object.keys(groupedStudents) as Array<keyof typeof groupedStudents>).map((group) => {
        const groupStudents = groupedStudents[group];
        if (groupStudents.length === 0) return null;

        return (
          <Card key={group}>
            <CardHeader>
              <CardTitle className="text-lg font-semibold">
                {group} ({groupStudents.length})
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
                {groupStudents.map((student) => (
                  <Link
                    href={`/dashboard/users/${student.studentId}`}
                    key={student.studentId}
                    className="block"
                  >
                    <div className="flex flex-col justify-between rounded-lg border p-3 shadow-sm hover:bg-accent transition-colors">
                      <div>
                        <h4 className="font-medium">{student.name}</h4>
                      </div>
                      <div className="mt-2 flex items-center justify-between">
                        <Badge className={STATUS_COLORS[student.status] || 'bg-muted-foreground'}>
                          {student.status.replace('_', ' ')}
                        </Badge>
                        <span className="text-xs text-muted-foreground">
                          {new Date(student.lastPlayed).toLocaleDateString('en-US', {
                            year: 'numeric',
                            month: 'short',
                            day: 'numeric',
                          })}
                        </span>
                      </div>
                    </div>
                  </Link>
                ))}
              </div>
            </CardContent>
          </Card>
        );
      })}

      {students.length === 0 && (
        <div className="text-center text-muted-foreground py-8">
          No students have this song in their repertoire yet.
        </div>
      )}
    </div>
  );
}
