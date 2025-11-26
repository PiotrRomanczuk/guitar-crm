'use client';

import { useTransition } from 'react';
import { QuickActionButton } from '../home/QuickActionButton';
import { syncLessonsFromCalendar } from '@/app/dashboard/actions';

export function SyncCalendarButton() {
  const [isPending, startTransition] = useTransition();

  const handleSync = () => {
    startTransition(async () => {
      try {
        const result = await syncLessonsFromCalendar();
        if (result.success) {
          alert(`Synced ${result.count} lessons successfully!`);
        } else {
          alert(`Failed to sync: ${result.error}`);
        }
      } catch (error) {
        alert('An unexpected error occurred while syncing.');
        console.error(error);
      }
    });
  };

  return (
    <QuickActionButton
      emoji={isPending ? '⏳' : '🔄'}
      title={isPending ? 'Syncing...' : 'Sync Calendar'}
      description="Sync lessons from Google Calendar"
      onClick={handleSync}
      disabled={isPending}
    />
  );
}
