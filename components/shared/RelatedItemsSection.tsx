import { ReactNode } from 'react';
import Link from 'next/link';
import EntityCard from './EntityCard';

interface RelatedItem {
  id: string;
  href: string;
  title: string;
  subtitle?: string;
  badge?: ReactNode;
  metadata?: Array<{ label: string; value: string | ReactNode }>;
  actions?: ReactNode;
}

interface RelatedItemsSectionProps {
  title: string;
  icon?: ReactNode;
  items: RelatedItem[];
  emptyMessage?: string;
  createAction?: {
    label: string;
    href: string;
  };
  loading?: boolean;
  className?: string;
  testId?: string;
}

/**
 * Standardized section for displaying related entities
 * Used across all entity detail pages to show relationships
 *
 * @example
 * <RelatedItemsSection
 *   title="Lessons Using This Song"
 *   icon={<MusicIcon />}
 *   items={lessons}
 *   emptyMessage="This song hasn't been used in any lessons yet"
 *   createAction={{ label: 'Add to Lesson', href: '/dashboard/lessons/new' }}
 * />
 */
export default function RelatedItemsSection({
  title,
  icon,
  items,
  emptyMessage = 'No items found',
  createAction,
  loading = false,
  className = '',
  testId,
}: RelatedItemsSectionProps) {
  return (
    <div
      className={`bg-card rounded-lg shadow-md p-4 sm:p-6 ${className}`}
      data-testid={testId}
    >
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center gap-2">
          {icon && <span className="text-muted-foreground">{icon}</span>}
          <h2 className="text-lg sm:text-xl font-bold text-foreground">
            {title} {!loading && `(${items.length})`}
          </h2>
        </div>
        {createAction && (
          <Link
            href={createAction.href}
            className="text-xs sm:text-sm px-3 py-1.5 bg-primary text-primary-foreground rounded-lg hover:bg-primary/90 transition-colors font-medium"
          >
            {createAction.label}
          </Link>
        )}
      </div>

      {loading ? (
        <div className="space-y-3">
          {[1, 2, 3].map((i) => (
            <div
              key={i}
              className="border border-border rounded-lg p-4 animate-pulse"
            >
              <div className="h-6 bg-muted rounded w-2/3 mb-2" />
              <div className="h-4 bg-muted rounded w-1/2" />
            </div>
          ))}
        </div>
      ) : items.length === 0 ? (
        <div className="text-center py-8">
          <p className="text-muted-foreground mb-4">{emptyMessage}</p>
          {createAction && (
            <Link
              href={createAction.href}
              className="inline-block px-4 py-2 bg-primary text-primary-foreground rounded-lg hover:bg-primary/90 transition-colors"
            >
              {createAction.label}
            </Link>
          )}
        </div>
      ) : (
        <div className="space-y-3">
          {items.map((item) => (
            <EntityCard
              key={item.id}
              title={item.title}
              subtitle={item.subtitle}
              href={item.href}
              badge={item.badge}
              metadata={item.metadata}
              actions={item.actions}
            />
          ))}
        </div>
      )}
    </div>
  );
}
