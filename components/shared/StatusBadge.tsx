import { ReactNode } from 'react';
import {
  STATUS_VARIANTS,
  StatusVariant,
  LESSON_STATUS_COLORS,
  SONG_STATUS_COLORS,
  SONG_LEVEL_COLORS,
  ASSIGNMENT_STATUS_COLORS,
  USER_STATUS_COLORS,
} from '@/lib/utils/status-colors';

type BadgeVariant = StatusVariant | 'default' | 'danger';

interface StatusBadgeProps {
  children: ReactNode;
  variant?: BadgeVariant;
  className?: string;
  testId?: string;
}

/**
 * Universal status badge component
 * Used for displaying status across all entities
 * Uses centralized status colors from /lib/utils/status-colors.ts
 *
 * @example
 * <StatusBadge variant="success">Completed</StatusBadge>
 * <StatusBadge variant="warning">Pending</StatusBadge>
 * <StatusBadge variant="error">Overdue</StatusBadge>
 */
export default function StatusBadge({
  children,
  variant = 'muted',
  className = '',
  testId,
}: StatusBadgeProps) {
  // Map legacy variants to new system
  const mappedVariant: StatusVariant = variant === 'default' ? 'muted' : variant === 'danger' ? 'error' : variant;
  const colorClasses = STATUS_VARIANTS[mappedVariant]?.badge ?? STATUS_VARIANTS.muted.badge;

  return (
    <span
      className={`inline-block px-2 sm:px-3 py-1 rounded-full text-xs font-medium border ${colorClasses} ${className}`}
      data-testid={testId}
    >
      {children}
    </span>
  );
}

/**
 * Helper function to get badge variant based on status string
 * Uses centralized status color mappings
 */
const COLOR_MAPS: Record<string, Record<string, StatusVariant>> = {
  lesson: LESSON_STATUS_COLORS,
  song: SONG_STATUS_COLORS,
  songLevel: SONG_LEVEL_COLORS,
  assignment: ASSIGNMENT_STATUS_COLORS,
  user: USER_STATUS_COLORS,
};

export function getStatusVariant(
  status: string | null | undefined,
  domain: 'lesson' | 'song' | 'songLevel' | 'assignment' | 'user' = 'lesson'
): StatusVariant {
  if (!status) return 'muted';
  return COLOR_MAPS[domain]?.[status] ?? 'muted';
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
