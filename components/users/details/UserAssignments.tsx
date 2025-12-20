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
    <div className="bg-white dark:bg-gray-800 rounded-xl shadow-lg border border-gray-200 dark:border-gray-700 p-4 sm:p-6">
      {/* Header */}
      <div className="flex items-center justify-between mb-6">
        <div>
          <h2 className="text-xl sm:text-2xl font-bold text-gray-900 dark:text-white">
            ✏️ Assignments
          </h2>
          <p className="text-sm text-gray-600 dark:text-gray-400 mt-1">
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
              className="p-4 border-2 border-gray-200 dark:border-gray-700 rounded-xl hover:shadow-md transition-all duration-200 bg-gradient-to-br from-white to-gray-50 dark:from-gray-800 dark:to-gray-750"
            >
              <div className="flex justify-between items-start gap-4">
                <div className="flex-1 min-w-0">
                  <p className="font-semibold text-gray-900 dark:text-white text-base sm:text-lg">
                    📝 {assignment.title || 'Untitled Assignment'}
                  </p>
                  <p className="text-sm text-gray-600 dark:text-gray-400 mt-2 line-clamp-2">
                    {assignment.description || 'No description provided'}
                  </p>
                  {assignment.due_date && (
                    <p className="text-sm text-orange-600 dark:text-orange-400 mt-2 font-medium">
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
                      ? 'bg-green-100 dark:bg-green-900/30 text-green-800 dark:text-green-300'
                      : assignment.status === 'in_progress'
                      ? 'bg-yellow-100 dark:bg-yellow-900/30 text-yellow-800 dark:text-yellow-300'
                      : 'bg-gray-100 dark:bg-gray-700 text-gray-800 dark:text-gray-300'
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
          <p className="text-gray-500 dark:text-gray-400 text-lg">📭 No assignments found</p>
          <p className="text-gray-400 dark:text-gray-500 text-sm mt-2">
            Assignments will appear here once created
          </p>
        </div>
      )}
    </div>
  );
}
