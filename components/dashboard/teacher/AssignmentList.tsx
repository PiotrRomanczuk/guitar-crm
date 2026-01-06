import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Calendar, User, FileText, Plus } from 'lucide-react';
import { cn } from '@/lib/utils';
import Link from 'next/link';

interface Assignment {
  id: string;
  title: string;
  studentName: string;
  dueDate: string;
  status: 'pending' | 'submitted' | 'overdue' | 'completed';
  songTitle?: string;
}

interface AssignmentListProps {
  assignments: Assignment[];
}

const statusConfig = {
  pending: { label: 'Pending', color: 'bg-muted text-muted-foreground border-0' },
  submitted: { label: 'Submitted', color: 'bg-primary/10 text-primary border-0' },
  overdue: { label: 'Overdue', color: 'bg-destructive/10 text-destructive border-0' },
  completed: {
    label: 'Completed',
    color: 'bg-emerald-500/15 text-emerald-700 dark:text-emerald-400 border-0',
  },
};

export function AssignmentList({ assignments }: AssignmentListProps) {
  return (
    <div
      className="bg-card rounded-xl border border-border overflow-hidden opacity-0 animate-fade-in"
      style={{ animationDelay: '350ms', animationFillMode: 'forwards' }}
    >
      <div className="p-6 border-b border-border">
        <h3 className="font-semibold">Assignments</h3>
        <p className="text-sm text-muted-foreground mt-1">Track student assignments</p>
      </div>

      {assignments.length === 0 ? (
        <div className="p-12 text-center">
          <div className="flex justify-center mb-4">
            <div className="w-16 h-16 rounded-full bg-muted flex items-center justify-center">
              <FileText className="w-8 h-8 text-muted-foreground" />
            </div>
          </div>
          <h3 className="text-lg font-semibold mb-2">No Assignments</h3>
          <p className="text-sm text-muted-foreground mb-6 max-w-sm mx-auto">
            Create assignments for your students to practice specific songs or techniques.
          </p>
          <Link href="/dashboard/assignments">
            <Button>
              <Plus className="w-4 h-4 mr-2" />
              Create Assignment
            </Button>
          </Link>
        </div>
      ) : (
        <div className="divide-y divide-border">
          {assignments.map((assignment) => {
          const { label, color } = statusConfig[assignment.status];
          return (
            <div key={assignment.id} className="p-4 hover:bg-muted/50 transition-colors">
              <div className="flex items-start justify-between gap-4">
                <div className="flex-1 min-w-0">
                  <p className="font-medium">{assignment.title}</p>
                  {assignment.songTitle && (
                    <p className="text-sm text-primary">{assignment.songTitle}</p>
                  )}

                  <div className="flex items-center gap-4 mt-2 text-sm text-muted-foreground">
                    <span className="flex items-center gap-1">
                      <User className="w-3 h-3" />
                      {assignment.studentName}
                    </span>
                    <span className="flex items-center gap-1">
                      <Calendar className="w-3 h-3" />
                      {assignment.dueDate}
                    </span>
                  </div>
                </div>

                <Badge variant="outline" className={cn('flex-shrink-0', color)}>
                  {label}
                </Badge>
              </div>
            </div>
          );
        })}
        </div>
      )}
    </div>
  );
}
