import { AssignmentItem } from '@/app/dashboard/users/[id]/actions';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';

interface StudentAssignmentsProps {
  assignments: AssignmentItem[];
}

export function StudentAssignments({ assignments }: StudentAssignmentsProps) {
  if (!assignments.length) {
    return <div className="text-muted-foreground italic">No assignments found.</div>;
  }

  const grouped = {
    overdue: assignments.filter(
      (a) =>
        a.status === 'overdue' ||
        (a.dueDate &&
          new Date(a.dueDate) < new Date() &&
          a.status !== 'completed' &&
          a.status !== 'cancelled')
    ),
    active: assignments.filter((a) => a.status === 'not_started' || a.status === 'in_progress'),
    completed: assignments.filter((a) => a.status === 'completed'),
    cancelled: assignments.filter((a) => a.status === 'cancelled'),
  };

  return (
    <div className="space-y-6">
      {/* Overdue */}
      {grouped.overdue.length > 0 && (
        <section>
          <h3 className="text-sm font-semibold text-destructive uppercase tracking-wider mb-3">
            Overdue ({grouped.overdue.length})
          </h3>
          <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
            {grouped.overdue.map((assignment) => (
              <AssignmentCard key={assignment.id} assignment={assignment} variant="overdue" />
            ))}
          </div>
        </section>
      )}

      {/* Active */}
      {grouped.active.length > 0 && (
        <section>
          <h3 className="text-sm font-semibold text-primary uppercase tracking-wider mb-3">
            Active ({grouped.active.length})
          </h3>
          <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
            {grouped.active.map((assignment) => (
              <AssignmentCard key={assignment.id} assignment={assignment} variant="active" />
            ))}
          </div>
        </section>
      )}

      {/* Completed */}
      {grouped.completed.length > 0 && (
        <section>
          <h3 className="text-sm font-semibold text-success uppercase tracking-wider mb-3">
            Completed ({grouped.completed.length})
          </h3>
          <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
            {grouped.completed.map((assignment) => (
              <AssignmentCard key={assignment.id} assignment={assignment} variant="completed" />
            ))}
          </div>
        </section>
      )}

      {/* Cancelled */}
      {grouped.cancelled.length > 0 && (
        <section>
          <h3 className="text-sm font-semibold text-muted-foreground uppercase tracking-wider mb-3">
            Cancelled ({grouped.cancelled.length})
          </h3>
          <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
            {grouped.cancelled.map((assignment) => (
              <AssignmentCard key={assignment.id} assignment={assignment} variant="cancelled" />
            ))}
          </div>
        </section>
      )}
    </div>
  );
}

function AssignmentCard({
  assignment,
  variant,
}: {
  assignment: AssignmentItem;
  variant: 'overdue' | 'active' | 'completed' | 'cancelled';
}) {
  const borderColors = {
    overdue: 'border-destructive/20 bg-destructive/10',
    active: 'border-primary/20 bg-primary/10',
    completed: 'border-success/20 bg-success/10',
    cancelled: 'border-border bg-muted',
  };

  return (
    <Card className={`transition-shadow hover:shadow-md ${borderColors[variant]}`}>
      <CardHeader className="p-4 pb-2">
        <div className="flex justify-between items-start">
          <CardTitle className="text-base font-medium truncate pr-2" title={assignment.title}>
            {assignment.title}
          </CardTitle>
          <Badge variant={getBadgeVariant(assignment.status)} className="capitalize">
            {assignment.status.replace('_', ' ')}
          </Badge>
        </div>
      </CardHeader>
      <CardContent className="p-4 pt-0">
        {assignment.description && (
          <p
            className="text-sm text-muted-foreground line-clamp-2 mb-3"
            title={assignment.description}
          >
            {assignment.description}
          </p>
        )}

        <div className="flex items-center text-xs text-muted-foreground mt-auto">
          {assignment.dueDate ? (
            <span>
              Due:{' '}
              {new Date(assignment.dueDate).toLocaleDateString('en-US', {
                month: 'short',
                day: 'numeric',
                year: 'numeric',
              })}
            </span>
          ) : (
            <span>No due date</span>
          )}
        </div>
      </CardContent>
    </Card>
  );
}

function getBadgeVariant(status: string): 'default' | 'secondary' | 'destructive' | 'outline' {
  switch (status) {
    case 'overdue':
      return 'destructive';
    case 'completed':
      return 'default';
    case 'cancelled':
      return 'outline';
    case 'in_progress':
      return 'secondary';
    default:
      return 'outline';
  }
}
