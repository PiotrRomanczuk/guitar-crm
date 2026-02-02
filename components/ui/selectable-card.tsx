'use client';

import * as React from 'react';
import { cn } from '@/lib/utils';
import { Check } from 'lucide-react';

interface SelectableCardProps {
  selected: boolean;
  onSelect: () => void;
  icon?: React.ReactNode;
  emoji?: string;
  title: string;
  description?: string;
  type?: 'checkbox' | 'radio';
  disabled?: boolean;
  className?: string;
  children?: React.ReactNode;
}

/**
 * Selectable card component for checkbox/radio card patterns
 * Used in onboarding (goal selection, skill level selection) and forms
 */
function SelectableCard({
  selected,
  onSelect,
  icon,
  emoji,
  title,
  description,
  type = 'checkbox',
  disabled = false,
  className,
  children,
}: SelectableCardProps) {
  return (
    <button
      type="button"
      role={type}
      aria-checked={selected}
      aria-disabled={disabled}
      onClick={() => !disabled && onSelect()}
      disabled={disabled}
      className={cn(
        'relative flex items-center justify-between w-full p-4 rounded-xl border-2 text-left',
        'transition-all duration-200 ease-in-out',
        'focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2',
        selected
          ? 'border-primary bg-primary/5 shadow-lg dark:shadow-[0_0_15px_hsl(var(--primary)/0.3)]'
          : 'border-border bg-card hover:border-primary/50',
        disabled && 'opacity-50 cursor-not-allowed',
        className
      )}
    >
      <div className="flex items-center gap-4">
        {/* Icon/Emoji container */}
        {(icon || emoji) && (
          <div
            className={cn(
              'flex h-12 w-12 items-center justify-center rounded-lg shrink-0',
              'transition-colors',
              selected
                ? 'bg-primary text-primary-foreground'
                : 'bg-muted text-muted-foreground'
            )}
          >
            {emoji ? (
              <span className="text-2xl">{emoji}</span>
            ) : (
              icon
            )}
          </div>
        )}

        {/* Text content */}
        <div className="flex flex-col min-w-0">
          <span className="font-bold text-foreground">{title}</span>
          {description && (
            <span className="text-sm text-muted-foreground line-clamp-2">
              {description}
            </span>
          )}
          {children}
        </div>
      </div>

      {/* Check indicator */}
      <div
        className={cn(
          'flex h-6 w-6 items-center justify-center rounded-full shrink-0 ml-3',
          'transition-all duration-200',
          selected
            ? 'bg-primary text-primary-foreground scale-100 opacity-100'
            : 'bg-transparent scale-75 opacity-0'
        )}
      >
        <Check className="h-4 w-4" strokeWidth={3} />
      </div>
    </button>
  );
}

export { SelectableCard };
