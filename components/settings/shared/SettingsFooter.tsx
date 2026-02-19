'use client';

import * as React from 'react';
import { cn } from '@/lib/utils';
import { Button } from '@/components/ui/button';

interface SettingsFooterProps {
  onSave: () => void;
  onReset?: () => void;
  onCancel?: () => void;
  saveLabel?: string;
  loading?: boolean;
  hasChanges?: boolean;
  className?: string;
}

/**
 * Sticky footer for settings pages with save, reset, and cancel buttons
 */
function SettingsFooter({
  onSave,
  onReset,
  onCancel,
  saveLabel = 'Save Changes',
  loading = false,
  hasChanges = true,
  className,
}: SettingsFooterProps) {
  return (
    <div
      className={cn(
        'fixed bottom-0 left-0 right-0 max-w-md mx-auto',
        'bg-background/95 backdrop-blur-md',
        'border-t p-4 pb-8 z-20',
        className
      )}
    >
      <div className="flex flex-col gap-3">
        <Button
          onClick={onSave}
          disabled={loading || !hasChanges}
          className="w-full h-12"
        >
          {loading ? 'Saving...' : saveLabel}
        </Button>
        {(onReset || onCancel) && (
          <div className="flex gap-3">
            {onReset && (
              <Button
                variant="outline"
                onClick={onReset}
                disabled={loading}
                className="flex-1 h-10"
              >
                Reset
              </Button>
            )}
            {onCancel && (
              <Button
                variant="ghost"
                onClick={onCancel}
                disabled={loading}
                className="flex-1 h-10 text-muted-foreground"
              >
                Cancel
              </Button>
            )}
          </div>
        )}
      </div>
    </div>
  );
}

export { SettingsFooter };
