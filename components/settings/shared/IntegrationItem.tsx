'use client';

import * as React from 'react';
import { cn } from '@/lib/utils';
import { LucideIcon } from 'lucide-react';

interface IntegrationItemProps {
  icon: LucideIcon;
  iconClassName?: string;
  name: string;
  description?: string;
  status: 'active' | 'inactive' | 'error';
  onClick?: () => void;
  className?: string;
}

const statusConfig = {
  active: {
    label: 'Active',
    dotClass: 'bg-primary shadow-[0_0_8px_hsl(var(--primary)/0.6)]',
    labelClass: 'text-primary',
  },
  inactive: {
    label: 'Connect',
    dotClass: 'bg-muted-foreground',
    labelClass: 'text-muted-foreground',
  },
  error: {
    label: 'Error',
    dotClass: 'bg-destructive shadow-[0_0_8px_hsl(var(--destructive)/0.6)]',
    labelClass: 'text-destructive',
  },
};

/**
 * Integration item for connected services like Google Calendar
 * Shows icon, name, description, and connection status
 */
function IntegrationItem({
  icon: Icon,
  iconClassName,
  name,
  description,
  status,
  onClick,
  className,
}: IntegrationItemProps) {
  const config = statusConfig[status];

  return (
    <div
      className={cn(
        'flex items-center gap-4 px-4 py-3 justify-between',
        'active:bg-muted/50 transition-colors cursor-pointer',
        className
      )}
      onClick={onClick}
    >
      <div className="flex items-center gap-4">
        <div className="flex items-center justify-center rounded-lg bg-muted shrink-0 w-10 h-10">
          <Icon className={cn('h-5 w-5 text-primary', iconClassName)} />
        </div>
        <div className="flex flex-col justify-center">
          <p className="text-base font-medium text-foreground leading-normal line-clamp-1">
            {name}
          </p>
          {description && (
            <p className="text-sm text-muted-foreground font-normal leading-normal line-clamp-1">
              {description}
            </p>
          )}
        </div>
      </div>
      <div className="shrink-0 flex items-center gap-2">
        <span className={cn('text-xs font-medium', config.labelClass)}>
          {config.label}
        </span>
        <div className={cn('w-2 h-2 rounded-full', config.dotClass)} />
      </div>
    </div>
  );
}

export { IntegrationItem };
