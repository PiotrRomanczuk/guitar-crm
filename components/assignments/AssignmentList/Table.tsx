'use client';

import { useRouter } from 'next/navigation';
import StatusBadge, { getStatusVariant } from '@/components/shared/StatusBadge';
import EntityLink from '@/components/shared/EntityLink';
import type { Assignment } from '@/components/assignments/hooks';

interface TableProps {
  assignments: Assignment[];
}

/**
 * Format date for display
 */
function formatDate(dateString: string | null): string {
  if (!dateString) return 'Not set';

  const date = new Date(dateString);
  return date.toLocaleDateString('en-US', {
    year: 'numeric',
    month: 'short',
    day: 'numeric',
  });
}

/**
 * Get status display text
 */
function getStatusText(status: string): string {
  return status.replace('_', ' ').replace(/\b\w/g, (l) => l.toUpperCase());
}

/**
 * Assignment list table with clickable rows
 */
export function Table({ assignments }: TableProps) {
  const router = useRouter();

  const handleRowClick = (id: string) => {
    router.push(`/dashboard/assignments/${id}`);
  };

  return (
    <div
      className="bg-white dark:bg-gray-800 rounded-lg shadow-sm border 
                    border-gray-200 dark:border-gray-700 overflow-hidden"
    >
      <div className="overflow-x-auto">
        <table className="w-full text-xs sm:text-sm">
          <thead
            className="bg-gray-50 dark:bg-gray-700 border-b 
                           border-gray-200 dark:border-gray-600"
          >
            <tr>
              <th
                className="px-3 sm:px-4 py-2 sm:py-3 text-left font-semibold 
                             text-gray-700 dark:text-gray-200"
              >
                Title
              </th>
              <th
                className="hidden md:table-cell px-3 sm:px-4 py-2 sm:py-3 text-left 
                             font-semibold text-gray-700 dark:text-gray-200"
              >
                Student
              </th>
              <th
                className="hidden lg:table-cell px-3 sm:px-4 py-2 sm:py-3 text-left 
                             font-semibold text-gray-700 dark:text-gray-200"
              >
                Due Date
              </th>
              <th
                className="px-3 sm:px-4 py-2 sm:py-3 text-left font-semibold 
                             text-gray-700 dark:text-gray-200"
              >
                Status
              </th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-200 dark:divide-gray-700">
            {assignments.map((assignment) => (
              <tr
                key={assignment.id}
                onClick={() => handleRowClick(assignment.id)}
                className="hover:bg-gray-50 dark:hover:bg-gray-700 cursor-pointer 
                           transition-colors duration-150"
              >
                <td className="px-3 sm:px-4 py-2 sm:py-3">
                  <EntityLink
                    href={`/dashboard/assignments/${assignment.id}`}
                    className="font-medium text-gray-900 dark:text-white hover:text-blue-600 
                               dark:hover:text-blue-400"
                    onClick={(e: React.MouseEvent) => e.stopPropagation()}
                  >
                    {assignment.title}
                  </EntityLink>
                  {assignment.description && (
                    <p
                      className="text-xs text-gray-600 dark:text-gray-400 mt-0.5 
                                  line-clamp-1"
                    >
                      {assignment.description}
                    </p>
                  )}
                </td>
                <td
                  className="hidden md:table-cell px-3 sm:px-4 py-2 sm:py-3 
                               text-gray-700 dark:text-gray-300"
                >
                  {assignment.student_profile?.full_name ||
                    assignment.student_profile?.email ||
                    'Unknown'}
                </td>
                <td
                  className="hidden lg:table-cell px-3 sm:px-4 py-2 sm:py-3 
                               text-gray-700 dark:text-gray-300"
                >
                  {formatDate(assignment.due_date)}
                </td>
                <td className="px-3 sm:px-4 py-2 sm:py-3">
                  <StatusBadge variant={getStatusVariant(assignment.status)}>
                    {getStatusText(assignment.status)}
                  </StatusBadge>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
