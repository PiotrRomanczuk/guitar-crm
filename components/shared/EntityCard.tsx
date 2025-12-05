import Link from 'next/link';
import { ReactNode } from 'react';

interface EntityCardProps {
  title: string;
  subtitle?: string;
  href: string;
  badge?: ReactNode;
  metadata?: Array<{ label: string; value: string | ReactNode }>;
  actions?: ReactNode;
  className?: string;
  testId?: string;
}

/**
 * Reusable card component for displaying entity information
 * Used in related items sections across all entity detail pages
 *
 * @example
 * <EntityCard
 *   title="Lesson #5"
 *   subtitle="Oct 25, 2025"
 *   href="/dashboard/lessons/123"
 *   badge={<StatusBadge status="completed" />}
 *   metadata={[
 *     { label: 'Student', value: <EntityLink href="/users/1">John</EntityLink> },
 *     { label: 'Teacher', value: <EntityLink href="/users/2">Sarah</EntityLink> }
 *   ]}
 *   actions={<Button>View</Button>}
 * />
 */
export default function EntityCard({
  title,
  subtitle,
  href,
  badge,
  metadata,
  actions,
  className = '',
  testId,
}: EntityCardProps) {
  return (
    <div
      className={`border border-gray-200 dark:border-gray-700 rounded-lg p-4 hover:border-blue-500 dark:hover:border-blue-500 hover:shadow-md transition-all duration-200 ${className}`}
      data-testid={testId}
    >
      <div className="flex items-start justify-between gap-4">
        <div className="flex-1 min-w-0">
          <div className="flex items-start gap-2 mb-1">
            <Link
              href={href}
              className="text-lg font-semibold text-blue-600 dark:text-blue-400 hover:underline truncate"
            >
              {title}
            </Link>
            {badge && <div className="shrink-0">{badge}</div>}
          </div>

          {subtitle && (
            <p className="text-sm text-gray-600 dark:text-gray-400 mb-3">{subtitle}</p>
          )}

          {metadata && metadata.length > 0 && (
            <div className="space-y-2">
              {metadata.map((item, index) => (
                <div
                  key={index}
                  className="flex items-start gap-2 text-xs sm:text-sm"
                >
                  <span className="font-medium text-gray-700 dark:text-gray-300 min-w-20">
                    {item.label}:
                  </span>
                  <span className="text-gray-900 dark:text-gray-100 flex-1">
                    {item.value}
                  </span>
                </div>
              ))}
            </div>
          )}
        </div>

        {actions && (
          <div
            className="shrink-0"
            onClick={(e) => e.stopPropagation()}
          >
            {actions}
          </div>
        )}
      </div>
    </div>
  );
}
