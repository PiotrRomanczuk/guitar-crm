'use client';

import * as React from 'react';
import Link from 'next/link';
import { cn } from '@/lib/utils';
import { ChevronRight, ExternalLink, LucideIcon } from 'lucide-react';

interface SettingsLinkProps {
  icon: LucideIcon;
  iconClassName?: string;
  label: string;
  value?: string;
  href?: string;
  external?: boolean;
  onClick?: () => void;
  className?: string;
}

/**
 * Settings link item with icon, label, optional value, and chevron/external indicator
 */
function SettingsLink({
  icon: Icon,
  iconClassName,
  label,
  value,
  href,
  external = false,
  onClick,
  className,
}: SettingsLinkProps) {
  const content = (
    <div
      className={cn(
        'flex items-center gap-4 px-4 py-3.5 justify-between',
        'active:bg-muted/50 transition-colors cursor-pointer group',
        className
      )}
      onClick={onClick}
    >
      <div className="flex items-center gap-4">
        <div className="flex items-center justify-center rounded-lg bg-muted shrink-0 w-10 h-10">
          <Icon className={cn('h-5 w-5 text-foreground', iconClassName)} />
        </div>
        <p className="text-base font-medium text-foreground">{label}</p>
      </div>
      <div className="flex items-center gap-2">
        {value && (
          <span className="text-sm text-muted-foreground">{value}</span>
        )}
        {external ? (
          <ExternalLink className="h-5 w-5 text-muted-foreground" />
        ) : (
          <ChevronRight className="h-5 w-5 text-muted-foreground" />
        )}
      </div>
    </div>
  );

  if (href) {
    if (external) {
      return (
        <a href={href} target="_blank" rel="noopener noreferrer">
          {content}
        </a>
      );
    }
    return <Link href={href}>{content}</Link>;
  }

  return content;
}

export { SettingsLink };
