'use client';

import { useState, useTransition } from 'react';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { updateLessonSongStatus } from '@/app/actions/songs';
import { toast } from 'sonner';
import { Badge } from '@/components/ui/badge';
import { useHaptic } from '@/hooks/use-haptic';

interface Props {
  lessonSongId: string;
  currentStatus: string;
}

const STATUS_OPTIONS = [
  { value: 'to_learn', label: 'To Learn' },
  { value: 'started', label: 'Started' },
  { value: 'remembered', label: 'Remembered' },
  { value: 'with_author', label: 'With Author' },
  { value: 'mastered', label: 'Mastered' },
];

function getStatusBadgeVariant(
  status: string | null | undefined
): 'default' | 'secondary' | 'destructive' | 'outline' {
  if (!status) return 'outline';

  switch (status) {
    case 'mastered':
      return 'default';
    case 'started':
    case 'in_progress':
      return 'secondary';
    case 'to_learn':
      return 'outline';
    default:
      return 'outline';
  }
}

export default function StatusSelect({ lessonSongId, currentStatus }: Props) {
  const [isPending, startTransition] = useTransition();
  const [status, setStatus] = useState(currentStatus);
  const haptic = useHaptic();

  const handleStatusChange = (newStatus: string) => {
    haptic(newStatus === 'mastered' ? 'success' : 'light');
    setStatus(newStatus);
    startTransition(async () => {
      try {
        await updateLessonSongStatus(lessonSongId, newStatus);
        toast.success('Status updated');
      } catch (error) {
        console.error(error);
        haptic('error');
        toast.error('Failed to update status');
        setStatus(currentStatus); // Revert on error
      }
    });
  };

  return (
    <Select value={status} onValueChange={handleStatusChange} disabled={isPending}>
      <SelectTrigger className="w-[140px] h-11 sm:h-8 border-dashed">
        <div className="flex items-center gap-2">
          <Badge variant={getStatusBadgeVariant(status)} className="w-2 h-2 rounded-full p-0" />
          <SelectValue placeholder="Status" />
        </div>
      </SelectTrigger>
      <SelectContent>
        {STATUS_OPTIONS.map((option) => (
          <SelectItem key={option.value} value={option.value}>
            {option.label}
          </SelectItem>
        ))}
      </SelectContent>
    </Select>
  );
}
