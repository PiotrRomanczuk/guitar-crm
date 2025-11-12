import Link from 'next/link';
import { ReactNode, MouseEvent } from 'react';

interface EntityLinkProps {
  href: string;
  children: ReactNode;
  variant?: 'default' | 'subtle' | 'bold';
  icon?: ReactNode;
  className?: string;
  onClick?: (e: MouseEvent<HTMLAnchorElement>) => void;
  testId?: string;
}

/**
 * Reusable link component for entity navigation
 * Provides consistent styling across all entity links
 *
 * @example
 * // Default link (blue, underline on hover)
 * <EntityLink href="/dashboard/users/123">John Doe</EntityLink>
 *
 * // Subtle link (gray, changes to blue on hover)
 * <EntityLink href="/dashboard/songs/456" variant="subtle">Wonderwall</EntityLink>
 *
 * // Bold link (larger, bold text)
 * <EntityLink href="/dashboard/lessons/789" variant="bold" icon={<MusicIcon />}>
 *   Lesson #5
 * </EntityLink>
 */
export default function EntityLink({
  href,
  children,
  variant = 'default',
  icon,
  className = '',
  onClick,
  testId,
}: EntityLinkProps) {
  const variantClasses = {
    default:
      'text-blue-600 dark:text-blue-400 hover:underline font-medium transition-colors duration-150',
    subtle:
      'text-gray-700 dark:text-gray-300 hover:text-blue-600 dark:hover:text-blue-400 hover:underline transition-colors duration-150',
    bold: 'text-lg font-semibold text-blue-600 dark:text-blue-400 hover:underline transition-colors duration-150',
  };

  const handleClick = (e: MouseEvent<HTMLAnchorElement>) => {
    if (onClick) {
      onClick(e);
    }
  };

  return (
    <Link
      href={href}
      className={`inline-flex items-center gap-1.5 ${variantClasses[variant]} ${className}`}
      onClick={handleClick}
      data-testid={testId}
    >
      {icon && <span className="shrink-0">{icon}</span>}
      <span>{children}</span>
    </Link>
  );
}
