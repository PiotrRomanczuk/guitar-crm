'use client';

import { useState, useTransition } from 'react';
import { Button } from '@/components/ui/button';
import { syncStudentsAction } from '@/app/dashboard/contacts/actions';
import { toast } from 'sonner';
import { RefreshCw } from 'lucide-react';

export function SyncStudentsButton() {
  const [isPending, startTransition] = useTransition();

  const handleSync = () => {
    startTransition(async () => {
      const result = await syncStudentsAction();
      if (result.success) {
        toast.success(result.message);
        if (result.errors && result.errors.length > 0) {
          console.error('Sync errors:', result.errors);
          toast.warning(`Synced with ${result.errors.length} errors. Check console.`);
        }
      } else {
        toast.error(result.error || 'Failed to sync students');
      }
    });
  };

  return (
    <Button variant="outline" onClick={handleSync} disabled={isPending}>
      <RefreshCw className={`mr-2 h-4 w-4 ${isPending ? 'animate-spin' : ''}`} />
      {isPending ? 'Syncing...' : 'Sync Students'}
    </Button>
  );
}
