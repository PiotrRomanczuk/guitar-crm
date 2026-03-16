'use client';

import { useEffect } from 'react';
import { AlertTriangle, RefreshCw, ArrowLeft } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { logger } from '@/lib/logger';

interface RouteErrorProps {
  error: Error & { digest?: string };
  reset: () => void;
  /** Context label shown in the heading, e.g. "cohorts" */
  context: string;
  /** Label for the back link (defaults to "Dashboard") */
  backLabel?: string;
  /** href for the back link (defaults to "/dashboard") */
  backHref?: string;
}

/**
 * Shared presentational component for Next.js App Router error.tsx files.
 *
 * Each route keeps its own error.tsx to satisfy the Next.js file-system
 * convention, but delegates rendering here to keep code DRY.
 *
 * @example
 * // app/dashboard/cohorts/error.tsx
 * export default function CohortsError(props) {
 *   return <RouteError {...props} context="cohorts" />;
 * }
 */
export function RouteError({
  error,
  reset,
  context,
  backLabel = 'Dashboard',
  backHref = '/dashboard',
}: RouteErrorProps) {
  useEffect(() => {
    logger.error(`[${context} Error]`, error);
  }, [error, context]);

  return (
    <div className="flex items-center justify-center min-h-[400px] p-4">
      <Card className="max-w-md w-full">
        <CardContent className="pt-6">
          <div className="flex flex-col items-center text-center space-y-4">
            <div className="flex h-12 w-12 items-center justify-center rounded-full bg-destructive/10">
              <AlertTriangle className="h-6 w-6 text-destructive" />
            </div>
            <div className="space-y-2">
              <h2 className="text-lg font-semibold">Error loading {context}</h2>
              <p className="text-sm text-muted-foreground">
                We couldn&apos;t load the {context}. Please try again.
              </p>
              {process.env.NODE_ENV === 'development' && (
                <p className="text-xs text-muted-foreground font-mono bg-muted p-2 rounded mt-2">
                  {error.message}
                </p>
              )}
            </div>
            <div className="flex gap-3 pt-2">
              <Button onClick={reset} variant="default">
                <RefreshCw className="mr-2 h-4 w-4" />
                Try again
              </Button>
              <Button variant="outline" asChild>
                <a href={backHref}>
                  <ArrowLeft className="mr-2 h-4 w-4" />
                  {backLabel}
                </a>
              </Button>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
