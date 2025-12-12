'use client';

import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { enableCalendarWebhook } from '@/app/actions/calendar-webhook';
import { toast } from 'sonner';
import { RadioReceiver } from 'lucide-react';

export function CalendarWebhookControl() {
  const [loading, setLoading] = useState(false);

  const handleEnable = async () => {
    setLoading(true);
    try {
      const result = await enableCalendarWebhook();
      if (result.success) {
        toast.success('Real-time sync enabled!');
      } else {
        toast.error(result.error || 'Failed to enable sync');
      }
    } catch {
      toast.error('An error occurred');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="p-4 border rounded-lg bg-card text-card-foreground shadow-sm mb-6">
      <div className="flex items-center justify-between">
        <div className="space-y-1">
          <h3 className="font-semibold flex items-center gap-2">
            <RadioReceiver className="h-4 w-4" />
            Real-time Sync
          </h3>
          <p className="text-sm text-muted-foreground">
            Automatically import new lessons when they are added to your Google Calendar.
          </p>
        </div>
        <Button onClick={handleEnable} disabled={loading} variant="outline">
          {loading ? 'Enabling...' : 'Enable Sync'}
        </Button>
      </div>
    </div>
  );
}
