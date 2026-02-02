'use client';

import * as React from 'react';
import { cn } from '@/lib/utils';
import { IOSToggle } from '@/components/ui/ios-toggle';
import { LucideIcon } from 'lucide-react';

interface SettingsToggleProps {
  icon: LucideIcon;
  iconClassName?: string;
  label: string;
  description?: string;
  checked: boolean;
  onCheckedChange: (checked: boolean) => void;
  disabled?: boolean;
  className?: string;
}

/**
 * Settings toggle item with icon, label, description, and iOS-style toggle
 */
function SettingsToggle({
  icon: Icon,
  iconClassName,
  label,
  description,
  checked,
  onCheckedChange,
  disabled = false,
  className,
}: SettingsToggleProps) {
  return (
    <div
      className={cn(
        'flex items-center gap-4 px-4 py-3.5 justify-between',
        className
      )}
    >
      <div className="flex items-center gap-4">
        <div className="flex items-center justify-center rounded-lg bg-muted shrink-0 w-10 h-10">
          <Icon className={cn('h-5 w-5 text-foreground', iconClassName)} />
        </div>
        <div className="flex flex-col">
          <p className="text-base font-medium text-foreground">{label}</p>
          {description && (
            <p className="text-xs text-muted-foreground">{description}</p>
          )}
        </div>
      </div>
      <div className="shrink-0">
        <IOSToggle
          checked={checked}
          onCheckedChange={onCheckedChange}
          disabled={disabled}
        />
      </div>
    </div>
  );
}

export { SettingsToggle };
