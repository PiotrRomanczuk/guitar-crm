'use client';

import * as React from 'react';
import { cn } from '@/lib/utils';
import { Button } from '@/components/ui/button';
import { Trash2 } from 'lucide-react';

interface DangerZoneProps {
  onDelete: () => void;
  deleteLabel?: string;
  lastActivity?: string;
  loading?: boolean;
  className?: string;
}

/**
 * Danger zone component for destructive actions
 * Shows delete button with optional last activity info
 */
function DangerZone({
  onDelete,
  deleteLabel = 'Delete User',
  lastActivity,
  loading = false,
  className,
}: DangerZoneProps) {
  return (
    <div className={cn('pt-4 pb-8', className)}>
      <Button
        variant="outline"
        onClick={onDelete}
        disabled={loading}
        className={cn(
          'w-full py-3.5 rounded-xl',
          'border-destructive/30 text-destructive',
          'hover:bg-destructive/10 hover:border-destructive/50',
          'transition-colors'
        )}
      >
        <Trash2 className="h-4 w-4 mr-2" />
        {loading ? 'Deleting...' : deleteLabel}
      </Button>
      {lastActivity && (
        <p className="text-center text-xs text-muted-foreground mt-4">
          Last activity: {lastActivity}
        </p>
      )}
    </div>
  );
}

export { DangerZone };
