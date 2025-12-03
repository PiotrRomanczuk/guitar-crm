import { AssignmentItem } from '@/app/dashboard/users/[id]/actions';

interface StudentAssignmentsProps {
  assignments: AssignmentItem[];
}

export function StudentAssignments({ assignments }: StudentAssignmentsProps) {
  if (!assignments.length) {
    return <div className="text-gray-500 dark:text-gray-400 italic">No assignments found.</div>;
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
          <h3 className="text-sm font-semibold text-red-600 dark:text-red-400 uppercase tracking-wider mb-3">
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
          <h3 className="text-sm font-semibold text-blue-600 dark:text-blue-400 uppercase tracking-wider mb-3">
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
          <h3 className="text-sm font-semibold text-green-600 dark:text-green-400 uppercase tracking-wider mb-3">
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
          <h3 className="text-sm font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-wider mb-3">
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
    overdue: 'border-red-200 dark:border-red-800 bg-red-50 dark:bg-red-900/10',
    active: 'border-blue-200 dark:border-blue-800 bg-blue-50 dark:bg-blue-900/10',
    completed: 'border-green-200 dark:border-green-800 bg-green-50 dark:bg-green-900/10',
    cancelled: 'border-gray-200 dark:border-gray-800 bg-gray-50 dark:bg-gray-900/10',
  };

  return (
    <div
      className={`p-4 rounded-lg border ${borderColors[variant]} transition-shadow hover:shadow-md`}
    >
      <div className="flex justify-between items-start mb-2">
        <h4
          className="font-medium text-gray-900 dark:text-white truncate pr-2"
          title={assignment.title}
        >
          {assignment.title}
        </h4>
        <span
          className={`text-xs px-2 py-0.5 rounded-full capitalize ${getStatusBadge(
            assignment.status
          )}`}
        >
          {assignment.status.replace('_', ' ')}
        </span>
      </div>

      {assignment.description && (
        <p
          className="text-sm text-gray-600 dark:text-gray-300 line-clamp-2 mb-3"
          title={assignment.description}
        >
          {assignment.description}
        </p>
      )}

      <div className="flex items-center text-xs text-gray-500 dark:text-gray-400 mt-auto">
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
    </div>
  );
}

function getStatusBadge(status: string) {
  switch (status) {
    case 'overdue':
      return 'bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-200';
    case 'completed':
      return 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200';
    case 'cancelled':
      return 'bg-gray-100 text-gray-800 dark:bg-gray-700 dark:text-gray-300';
    case 'in_progress':
      return 'bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-200';
    default:
      return 'bg-gray-100 text-gray-800 dark:bg-gray-700 dark:text-gray-300';
  }
}
