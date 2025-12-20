'use client';

import { useState, useTransition } from 'react';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { updateLessonSongStatus } from '@/app/dashboard/lessons/actions';
import { Database } from '@/database.types';
import { toast } from 'sonner';

type LessonSongStatus = Database['public']['Enums']['lesson_song_status'];

interface LessonSongStatusSelectProps {
  lessonId: string;
  songId: string;
  currentStatus: LessonSongStatus;
}

export function LessonSongStatusSelect({
  lessonId,
  songId,
  currentStatus,
}: LessonSongStatusSelectProps) {
  const [isPending, startTransition] = useTransition();
  const [status, setStatus] = useState<LessonSongStatus>(currentStatus);

  const handleStatusChange = (value: string) => {
    const newStatus = value as LessonSongStatus;
    const oldStatus = status;
    setStatus(newStatus); // Optimistic update

    startTransition(async () => {
      try {
        await updateLessonSongStatus(lessonId, songId, newStatus);
        toast.success('Status updated');
      } catch (error) {
        console.error('Failed to update status:', error);
        setStatus(oldStatus); // Revert on error
        toast.error('Failed to update song status');
      }
    });
  };

  const statusLabels: Record<LessonSongStatus, string> = {
    to_learn: 'To Learn',
    started: 'Started',
    remembered: 'Remembered',
    with_author: 'With Author',
    mastered: 'Mastered',
  };

  return (
    <Select value={status} onValueChange={handleStatusChange} disabled={isPending}>
      <SelectTrigger className="w-[140px] h-8 text-xs">
        <SelectValue placeholder="Status" />
      </SelectTrigger>
      <SelectContent>
        {Object.entries(statusLabels).map(([value, label]) => (
          <SelectItem key={value} value={value} className="text-xs">
            {label}
          </SelectItem>
        ))}
      </SelectContent>
    </Select>
  );
}
