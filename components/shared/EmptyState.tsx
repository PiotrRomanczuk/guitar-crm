import Link from 'next/link';
import Image from 'next/image';
import { LucideIcon } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';

interface EmptyStateProps {
  icon?: LucideIcon;
  illustration?: string;
  title: string;
  description?: string;
  action?: {
    label: string;
    href?: string;
    onClick?: () => void;
  };
  variant?: 'default' | 'card' | 'table-cell';
}

/**
 * Provides consistent empty state displays for tables and lists.
 *
 * @example Default variant (centered with padding)
 * ```tsx
 * <EmptyState
 *   icon={Music}
 *   title="No songs yet"
 *   description="Add your first song to get started"
 *   action={{ label: "Add Song", href: "/songs/new" }}
 * />
 * ```
 *
 * @example Card variant (wrapped in Card component)
 * ```tsx
 * <EmptyState
 *   variant="card"
 *   illustration="/images/empty-lessons.svg"
 *   title="No lessons scheduled"
 *   description="Schedule a lesson to see it here"
 *   action={{ label: "Schedule Lesson", onClick: () => openModal() }}
 * />
 * ```
 *
 * @example Table cell variant (compact for use inside tables)
 * ```tsx
 * <tr>
 *   <td colSpan={5}>
 *     <EmptyState
 *       variant="table-cell"
 *       icon={Users}
 *       title="No students found"
 *       description="Try adjusting your search filters"
 *     />
 *   </td>
 * </tr>
 * ```
 */
export default function EmptyState({
  icon: Icon,
  illustration,
  title,
  description,
  action,
  variant = 'default',
}: EmptyStateProps) {
  const content = (
    <div className="flex flex-col items-center text-center">
      {illustration && (
        <Image
          src={illustration}
          alt=""
          width={48}
          height={48}
          className="mb-4"
          aria-hidden="true"
        />
      )}
      {Icon && !illustration && (
        <Icon
          className="size-12 text-muted-foreground mb-4"
          aria-hidden="true"
        />
      )}
      <h3 className="text-lg font-medium text-foreground">{title}</h3>
      {description && (
        <p className="text-sm text-muted-foreground mt-1 max-w-sm">
          {description}
        </p>
      )}
      {action && (
        <div className="mt-4">
          {action.href ? (
            <Button asChild>
              <Link href={action.href}>{action.label}</Link>
            </Button>
          ) : (
            <Button onClick={action.onClick}>{action.label}</Button>
          )}
        </div>
      )}
    </div>
  );

  if (variant === 'card') {
    return (
      <Card>
        <CardContent className="py-12">{content}</CardContent>
      </Card>
    );
  }

  const paddingClass = variant === 'table-cell' ? 'py-8' : 'py-12';

  return <div className={paddingClass}>{content}</div>;
}
