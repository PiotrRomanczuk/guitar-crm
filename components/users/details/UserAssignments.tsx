'use client';

interface Assignment {
  id: string;
  title: string | null;
  description: string | null;
  due_date: string | null;
  status: string | null;
}

interface UserAssignmentsProps {
  assignments: Assignment[] | null;
}

export default function UserAssignments({ assignments }: UserAssignmentsProps) {
  return (
    <div className="bg-card rounded-xl shadow-lg border border-border p-4 sm:p-6">
      {/* Header */}
      <div className="flex items-center justify-between mb-6">
        <div>
          <h2 className="text-xl sm:text-2xl font-bold text-foreground">
            ✏️ Assignments
          </h2>
          <p className="text-sm text-muted-foreground mt-1">
            {assignments?.length || 0} total assignment{assignments?.length !== 1 ? 's' : ''}
          </p>
        </div>
      </div>

      {/* Assignments List */}
      {assignments && assignments.length > 0 ? (
        <div className="space-y-3 max-h-[500px] overflow-y-auto pr-2">
          {assignments.map((assignment) => (
            <div
              key={assignment.id}
              className="p-4 border-2 border-border rounded-xl hover:shadow-md transition-all duration-200 bg-card"
            >
              <div className="flex justify-between items-start gap-4">
                <div className="flex-1 min-w-0">
                  <p className="font-semibold text-foreground text-base sm:text-lg">
                    📝 {assignment.title || 'Untitled Assignment'}
                  </p>
                  <p className="text-sm text-muted-foreground mt-2 line-clamp-2">
                    {assignment.description || 'No description provided'}
                  </p>
                  {assignment.due_date && (
                    <p className="text-sm text-warning mt-2 font-medium">
                      ⏰ Due:{' '}
                      {new Date(assignment.due_date).toLocaleDateString('en-US', {
                        weekday: 'short',
                        year: 'numeric',
                        month: 'short',
                        day: 'numeric',
                      })}
                    </p>
                  )}
                </div>
                <span
                  className={`px-3 py-1.5 rounded-lg text-xs font-semibold whitespace-nowrap ${
                    assignment.status === 'completed'
                      ? 'bg-success/10 text-success'
                      : assignment.status === 'in_progress'
                      ? 'bg-warning/10 text-warning'
                      : 'bg-muted text-muted-foreground'
                  }`}
                >
                  {assignment.status === 'completed'
                    ? '✅'
                    : assignment.status === 'in_progress'
                    ? '⏳'
                    : '⏸️'}{' '}
                  {assignment.status || 'pending'}
                </span>
              </div>
            </div>
          ))}
        </div>
      ) : (
        <div className="text-center py-12">
          <p className="text-muted-foreground text-lg">No assignments found</p>
          <p className="text-muted-foreground/70 text-sm mt-2">
            Assignments will appear here once created
          </p>
        </div>
      )}
    </div>
  );
}
