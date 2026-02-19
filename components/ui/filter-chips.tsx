'use client';

import * as React from 'react';
import { cn } from '@/lib/utils';

interface FilterChip {
  id: string;
  label: string;
  count?: number;
}

interface FilterChipsProps {
  chips: FilterChip[];
  selected: string | string[];
  onChange: (value: string | string[]) => void;
  multiple?: boolean;
  className?: string;
}

/**
 * Horizontal scrollable filter chips component
 * Supports single or multi-select mode
 */
function FilterChips({
  chips,
  selected,
  onChange,
  multiple = false,
  className,
}: FilterChipsProps) {
  const selectedArray = Array.isArray(selected) ? selected : [selected];

  const handleClick = (chipId: string) => {
    if (multiple) {
      const newSelected = selectedArray.includes(chipId)
        ? selectedArray.filter((id) => id !== chipId)
        : [...selectedArray, chipId];
      onChange(newSelected);
    } else {
      onChange(chipId);
    }
  };

  return (
    <div
      className={cn(
        'flex gap-2 overflow-x-auto pb-2 scrollbar-hide',
        '-mx-1 px-1', // Negative margin to allow focus rings to show
        className
      )}
      role="group"
      aria-label="Filter options"
    >
      {chips.map((chip) => {
        const isSelected = selectedArray.includes(chip.id);
        return (
          <button
            key={chip.id}
            type="button"
            onClick={() => handleClick(chip.id)}
            className={cn(
              'inline-flex items-center gap-1.5 whitespace-nowrap rounded-full px-4 py-2 text-sm font-medium transition-all',
              'focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2',
              'shrink-0',
              isSelected
                ? 'bg-primary text-primary-foreground shadow-sm'
                : 'bg-muted text-muted-foreground hover:bg-muted/80 hover:text-foreground'
            )}
            aria-pressed={isSelected}
          >
            {chip.label}
            {chip.count !== undefined && (
              <span
                className={cn(
                  'inline-flex items-center justify-center rounded-full text-xs font-semibold min-w-[1.25rem] h-5 px-1',
                  isSelected
                    ? 'bg-primary-foreground/20 text-primary-foreground'
                    : 'bg-foreground/10 text-muted-foreground'
                )}
              >
                {chip.count}
              </span>
            )}
          </button>
        );
      })}
    </div>
  );
}

export { FilterChips, type FilterChip };
