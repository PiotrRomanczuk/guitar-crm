'use client';

import { useState, useTransition } from 'react';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { syncLessonsFromCalendar } from '@/app/dashboard/actions';
import { QuickActionButton } from './QuickActionButton';

export function SyncCalendarModal() {
  const [open, setOpen] = useState(false);
  const [email, setEmail] = useState('');
  const [isPending, startTransition] = useTransition();

  const handleSync = (e: React.FormEvent) => {
    e.preventDefault();
    startTransition(async () => {
      try {
        const result = await syncLessonsFromCalendar(email);
        if (result.success) {
          alert(`Synced ${result.count} lessons successfully!`);
          setOpen(false);
          setEmail('');
        }
      } catch (error) {
        console.error(error);
        if (error instanceof Error) {
          alert(`Failed to sync: ${error.message}`);
        } else {
          alert('An unexpected error occurred.');
        }
      }
    });
  };

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <div className="w-full">
          <QuickActionButton
            emoji="🔄"
            title="Sync Calendar"
            description="Sync lessons from Google Calendar"
          />
        </div>
      </DialogTrigger>
      <DialogContent className="sm:max-w-[425px]">
        <DialogHeader>
          <DialogTitle>Sync Calendar Lessons</DialogTitle>
        </DialogHeader>
        <form onSubmit={handleSync} className="grid gap-4 py-4">
          <div className="grid gap-2">
            <Label htmlFor="student-email">Student Email</Label>
            <Input
              id="student-email"
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="student@example.com"
              required
            />
            <p className="text-sm text-muted-foreground">
              Enter the email of the student to sync lessons for.
            </p>
          </div>
          <div className="flex justify-end gap-3 mt-4">
            <Button type="button" variant="outline" onClick={() => setOpen(false)}>
              Cancel
            </Button>
            <Button type="submit" disabled={isPending}>
              {isPending ? 'Syncing...' : 'Sync Lessons'}
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
}
