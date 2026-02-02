'use client';

import * as React from 'react';
import { cn } from '@/lib/utils';

interface SettingsSectionProps {
  title: string;
  children: React.ReactNode;
  className?: string;
}

/**
 * Settings section with header and card container
 */
function SettingsSection({ title, children, className }: SettingsSectionProps) {
  return (
    <div className={className}>
      <h3 className="text-xs font-bold text-muted-foreground uppercase tracking-wider px-6 py-3 mt-4">
        {title}
      </h3>
      <div
        className={cn(
          'bg-card mx-4 rounded-xl overflow-hidden shadow-sm',
          'divide-y divide-border',
          'border'
        )}
      >
        {children}
      </div>
    </div>
  );
}

export { SettingsSection };
