import Link from 'next/link';
import { ReactNode } from 'react';

interface BreadcrumbItem {
  label: string;
  href?: string;
  icon?: ReactNode;
}

interface BreadcrumbsProps {
  items: BreadcrumbItem[];
  className?: string;
  testId?: string;
}

/**
 * Breadcrumb navigation component
 * Shows hierarchical navigation path
 *
 * @example
 * <Breadcrumbs items={[
 *   { label: 'Dashboard', href: '/dashboard' },
 *   { label: 'Lessons', href: '/dashboard/lessons' },
 *   { label: 'Lesson #5' } // Current page (no href)
 * ]} />
 */
export default function Breadcrumbs({ items, className = '', testId }: BreadcrumbsProps) {
  return (
    <nav
      className={`flex items-center gap-2 text-xs sm:text-sm text-gray-600 dark:text-gray-400 mb-4 ${className}`}
      aria-label="Breadcrumb"
      data-testid={testId}
    >
      {items.map((item, index) => {
        const isLast = index === items.length - 1;

        return (
          <div key={index} className="flex items-center gap-2">
            {index > 0 && (
              <span className="text-gray-400 dark:text-gray-600" aria-hidden="true">
                /
              </span>
            )}

            {item.href && !isLast ? (
              <Link
                href={item.href}
                className="hover:text-blue-600 dark:hover:text-blue-400 hover:underline transition-colors flex items-center gap-1"
              >
                {item.icon && <span>{item.icon}</span>}
                <span>{item.label}</span>
              </Link>
            ) : (
              <span
                className={`flex items-center gap-1 ${
                  isLast
                    ? 'font-semibold text-gray-900 dark:text-gray-100'
                    : 'text-gray-600 dark:text-gray-400'
                }`}
                aria-current={isLast ? 'page' : undefined}
              >
                {item.icon && <span>{item.icon}</span>}
                <span>{item.label}</span>
              </span>
            )}
          </div>
        );
      })}
    </nav>
  );
}
