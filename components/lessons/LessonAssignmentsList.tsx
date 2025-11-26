import Link from 'next/link';
import { Database } from '@/database.types';

interface Assignment {
  id: string;
  title: string;
  status: Database['public']['Enums']['assignment_status'];
  due_date: string | null;
}

interface LessonAssignmentsListProps {
  lessonId: string;
  assignments: Assignment[];
  canEdit: boolean;
}

export function LessonAssignmentsList({
  lessonId,
  assignments,
  canEdit,
}: LessonAssignmentsListProps) {
  return (
    <div className="bg-white dark:bg-gray-800 rounded-lg shadow-md p-6 mb-6">
      <div className="flex items-center justify-between mb-4">
        <h2 className="text-xl font-bold text-gray-900 dark:text-white">Assignments</h2>
        {canEdit && (
          <Link
            href={`/dashboard/assignments/new?lessonId=${lessonId}`}
            className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 text-sm font-medium"
          >
            Add Assignment
          </Link>
        )}
      </div>

      {assignments && assignments.length > 0 ? (
        <ul className="divide-y divide-gray-200 dark:divide-gray-700">
          {assignments.map((assignment) => (
            <li key={assignment.id} className="py-3 flex justify-between items-center">
              <div>
                <Link
                  href={`/dashboard/assignments/${assignment.id}`}
                  className="font-medium text-blue-600 hover:underline dark:text-blue-400"
                >
                  {assignment.title}
                </Link>
                {assignment.due_date && (
                  <p className="text-sm text-gray-500 dark:text-gray-400">
                    Due: {new Date(assignment.due_date).toLocaleDateString()}
                  </p>
                )}
              </div>
              <div>
                <span
                  className={`px-2 py-1 rounded-full text-xs font-medium ${
                    assignment.status === 'COMPLETED'
                      ? 'bg-green-100 text-green-800'
                      : assignment.status === 'IN_PROGRESS'
                      ? 'bg-blue-100 text-blue-800'
                      : 'bg-gray-100 text-gray-800'
                  }`}
                >
                  {assignment.status}
                </span>
              </div>
            </li>
          ))}
        </ul>
      ) : (
        <p className="text-gray-500 dark:text-gray-400">No assignments for this lesson.</p>
      )}
    </div>
  );
}
