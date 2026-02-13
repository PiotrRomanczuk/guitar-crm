'use client';

import React from 'react';
import { ChevronDown } from 'lucide-react';
import {
  Collapsible,
  CollapsibleContent,
  CollapsibleTrigger,
} from '@/components/ui/collapsible';
import { Badge } from '@/components/ui/badge';
import { cn } from '@/lib/utils';

interface FieldGroupProps {
  title: string;
  description?: string;
  isOpen: boolean;
  onToggle: () => void;
  isRequired?: boolean;
  fieldCount?: number;
  children: React.ReactNode;
  className?: string;
}

export default function FieldGroup({
  title,
  description,
  isOpen,
  onToggle,
  isRequired = false,
  fieldCount,
  children,
  className,
}: FieldGroupProps) {
  return (
    <Collapsible open={isOpen} onOpenChange={onToggle} className={cn('space-y-4', className)}>
      <CollapsibleTrigger className="w-full group" asChild>
        <button
          type="button"
          className="flex items-center justify-between w-full p-4 rounded-lg border border-border bg-card hover:bg-accent/50 transition-colors"
        >
          <div className="flex items-center gap-3">
            <ChevronDown
              className={cn(
                'h-5 w-5 text-muted-foreground transition-transform duration-200',
                isOpen && 'rotate-180'
              )}
            />
            <div className="text-left">
              <h3 className="font-semibold text-foreground flex items-center gap-2">
                {title}
                {isRequired && (
                  <Badge variant="destructive" className="text-xs">
                    Required
                  </Badge>
                )}
                {!isRequired && fieldCount !== undefined && (
                  <Badge variant="secondary" className="text-xs">
                    {fieldCount} {fieldCount === 1 ? 'field' : 'fields'}
                  </Badge>
                )}
              </h3>
              {description && (
                <p className="text-sm text-muted-foreground mt-1">{description}</p>
              )}
            </div>
          </div>
        </button>
      </CollapsibleTrigger>

      <CollapsibleContent className="space-y-4 px-1">
        {children}
      </CollapsibleContent>
    </Collapsible>
  );
}
