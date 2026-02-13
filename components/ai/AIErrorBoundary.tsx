'use client';

import * as React from 'react';
import { AlertCircle, RefreshCw } from 'lucide-react';
import { Button } from '@/components/ui/button';

interface AIErrorBoundaryProps {
  children: React.ReactNode;
  /** Fallback UI to show on error */
  fallback?: React.ReactNode;
  /** Callback when retry is clicked */
  onRetry?: () => void;
}

interface AIErrorBoundaryState {
  hasError: boolean;
  error: Error | null;
}

/**
 * Error boundary for AI streaming components
 *
 * Catches errors during streaming and shows a user-friendly error message
 * with a retry button. Automatically clears error on retry.
 *
 * @example
 * ```tsx
 * <AIErrorBoundary onRetry={() => aiStream.reset()}>
 *   <AIStreamingComponent />
 * </AIErrorBoundary>
 * ```
 */
export class AIErrorBoundary extends React.Component<
  AIErrorBoundaryProps,
  AIErrorBoundaryState
> {
  constructor(props: AIErrorBoundaryProps) {
    super(props);
    this.state = { hasError: false, error: null };
  }

  static getDerivedStateFromError(error: Error): AIErrorBoundaryState {
    return { hasError: true, error };
  }

  componentDidCatch(error: Error, errorInfo: React.ErrorInfo) {
    console.error('[AIErrorBoundary] Caught error:', error, errorInfo);
  }

  handleRetry = () => {
    // Clear error state
    this.setState({ hasError: false, error: null });
    // Call parent retry callback
    this.props.onRetry?.();
  };

  render() {
    if (this.state.hasError) {
      // Custom fallback UI
      if (this.props.fallback) {
        return this.props.fallback;
      }

      // Default error UI
      return (
        <div className="rounded-lg border border-destructive/50 bg-destructive/10 p-6">
          <div className="flex items-start gap-4">
            <AlertCircle className="h-5 w-5 text-destructive flex-shrink-0 mt-0.5" />
            <div className="flex-1 space-y-2">
              <h3 className="font-semibold text-destructive">
                AI Streaming Error
              </h3>
              <p className="text-sm text-muted-foreground">
                {this.state.error?.message || 'An unexpected error occurred during streaming.'}
              </p>
              {this.props.onRetry && (
                <Button
                  variant="outline"
                  size="sm"
                  onClick={this.handleRetry}
                  className="mt-3"
                >
                  <RefreshCw className="h-3 w-3 mr-2" />
                  Try Again
                </Button>
              )}
            </div>
          </div>
        </div>
      );
    }

    return this.props.children;
  }
}
