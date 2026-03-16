'use client';

import { cn } from '@/lib/utils';

interface MobilePageShellProps {
  title: string;
  subtitle?: string;
  actions?: React.ReactNode;
  fab?: React.ReactNode;
  children: React.ReactNode;
  className?: string;
}

/**
 * v2 page wrapper: sticky header + scrollable content + safe area.
 * Provides consistent spacing and structure for all v2 mobile pages.
 */
export function MobilePageShell({
  title,
  subtitle,
  actions,
  fab,
  children,
  className,
}: MobilePageShellProps) {
  return (
    <div className="flex flex-col min-h-[100dvh] bg-background">
      {/* Sticky header */}
      <header className="sticky top-0 z-30 bg-background/95 backdrop-blur-sm border-b border-border px-4 py-3 md:px-6">
        <div className="flex items-center justify-between gap-3">
          <div className="min-w-0 flex-1">
            <h1 className="text-xl sm:text-2xl lg:text-3xl font-bold tracking-tight truncate">
              {title}
            </h1>
            {subtitle && (
              <p className="text-xs sm:text-sm text-muted-foreground mt-0.5 truncate">
                {subtitle}
              </p>
            )}
          </div>
          {actions && (
            <div className="flex items-center gap-2 shrink-0">{actions}</div>
          )}
        </div>
      </header>

      {/* Scrollable content */}
      <main
        className={cn(
          'flex-1 overflow-y-auto px-4 py-4 md:px-6 md:py-6 lg:px-8',
          'pb-[calc(4rem+env(safe-area-inset-bottom))]',
          className,
        )}
      >
        {children}
      </main>

      {/* FAB slot */}
      {fab}
    </div>
  );
}
