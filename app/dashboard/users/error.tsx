'use client';

import { useEffect } from 'react';
import { Users, RefreshCw, ArrowLeft } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';

/**
 * Error boundary for users routes
 */
export default function UsersError({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  useEffect(() => {
    console.error('[Users Error]', error);
  }, [error]);

  return (
    <div className="flex items-center justify-center min-h-[400px] p-4">
      <Card className="max-w-md w-full">
        <CardContent className="pt-6">
          <div className="flex flex-col items-center text-center space-y-4">
            <div className="flex h-12 w-12 items-center justify-center rounded-full bg-destructive/10">
              <Users className="h-6 w-6 text-destructive" />
            </div>
            <div className="space-y-2">
              <h2 className="text-lg font-semibold">Error loading users</h2>
              <p className="text-sm text-muted-foreground">
                We couldn&apos;t load the users. Please try again.
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
                <a href="/dashboard">
                  <ArrowLeft className="mr-2 h-4 w-4" />
                  Back
                </a>
              </Button>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
