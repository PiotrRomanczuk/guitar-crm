import { ReactNode } from 'react';

type BadgeVariant =
  | 'default'
  | 'success'
  | 'warning'
  | 'danger'
  | 'info'
  | 'gray'
  | 'blue'
  | 'green'
  | 'yellow'
  | 'red'
  | 'purple';

interface StatusBadgeProps {
  children: ReactNode;
  variant?: BadgeVariant;
  className?: string;
  testId?: string;
}

/**
 * Universal status badge component
 * Used for displaying status across all entities
 *
 * @example
 * <StatusBadge variant="success">Completed</StatusBadge>
 * <StatusBadge variant="warning">Pending</StatusBadge>
 * <StatusBadge variant="danger">Overdue</StatusBadge>
 */
export default function StatusBadge({
  children,
  variant = 'default',
  className = '',
  testId,
}: StatusBadgeProps) {
  const variantClasses: Record<BadgeVariant, string> = {
    default: 'bg-gray-100 dark:bg-gray-700 text-gray-800 dark:text-gray-200',
    success: 'bg-green-100 dark:bg-green-900/30 text-green-800 dark:text-green-200',
    warning: 'bg-yellow-100 dark:bg-yellow-900/30 text-yellow-800 dark:text-yellow-200',
    danger: 'bg-red-100 dark:bg-red-900/30 text-red-800 dark:text-red-200',
    info: 'bg-blue-100 dark:bg-blue-900/30 text-blue-800 dark:text-blue-200',
    gray: 'bg-gray-100 dark:bg-gray-700 text-gray-800 dark:text-gray-200',
    blue: 'bg-blue-100 dark:bg-blue-900/30 text-blue-800 dark:text-blue-200',
    green: 'bg-green-100 dark:bg-green-900/30 text-green-800 dark:text-green-200',
    yellow: 'bg-yellow-100 dark:bg-yellow-900/30 text-yellow-800 dark:text-yellow-200',
    red: 'bg-red-100 dark:bg-red-900/30 text-red-800 dark:text-red-200',
    purple: 'bg-purple-100 dark:bg-purple-900/30 text-purple-800 dark:text-purple-200',
  };

  return (
    <span
      className={`inline-block px-2 sm:px-3 py-1 rounded-full text-xs font-medium ${variantClasses[variant]} ${className}`}
      data-testid={testId}
    >
      {children}
    </span>
  );
}

/**
 * Helper function to get badge variant based on status string
 */
export function getStatusVariant(status: string | null | undefined): BadgeVariant {
  if (!status) return 'default';

  const statusLower = status.toLowerCase();

  // Status to variant mapping
  const statusMap: Record<string, BadgeVariant> = {
    // Lesson statuses
    completed: 'success',
    scheduled: 'info',
    cancelled: 'danger',
    // Song learning statuses
    mastered: 'success',
    with_author: 'purple',
    remembered: 'yellow',
    started: 'blue',
    to_learn: 'gray',
    // Assignment statuses
    pending: 'warning',
    overdue: 'danger',
    in_progress: 'info',
    // Difficulty levels
    beginner: 'green',
    intermediate: 'yellow',
    advanced: 'red',
  };

  return statusMap[statusLower] || 'default';
}

/**
 * Helper function to format status text
 */
export function formatStatus(status: string | null | undefined): string {
  if (!status) return 'Unknown';

  return status
    .split('_')
    .map((word) => word.charAt(0).toUpperCase() + word.slice(1))
    .join(' ');
}
