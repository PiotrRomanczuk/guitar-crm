'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { VALID_STATUS_TRANSITIONS } from '@/schemas/AssignmentSchema';
import StatusBadge, { getStatusVariant, formatStatus } from '@/components/shared/StatusBadge';
import { toast } from 'sonner';
import { Loader2 } from 'lucide-react';

interface AssignmentStatusSelectProps {
  assignmentId: string;
  currentStatus: string;
  canEdit: boolean;
}

export function AssignmentStatusSelect({
  assignmentId,
  currentStatus,
  canEdit,
}: AssignmentStatusSelectProps) {
  const router = useRouter();
  const [updating, setUpdating] = useState(false);
  const validTransitions = VALID_STATUS_TRANSITIONS[currentStatus] || [];

  if (!canEdit || validTransitions.length === 0) {
    return (
      <StatusBadge variant={getStatusVariant(currentStatus)}>
        {formatStatus(currentStatus)}
      </StatusBadge>
    );
  }

  const handleStatusChange = async (newStatus: string) => {
    if (newStatus === currentStatus) return;
    setUpdating(true);
    try {
      const response = await fetch(`/api/assignments/${assignmentId}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ status: newStatus }),
      });
      if (!response.ok) {
        const errorData = await response
          .json()
          .catch(() => ({ error: 'Failed to update status' }));
        throw new Error(errorData.error || 'Failed to update status');
      }
      toast.success(`Status updated to ${formatStatus(newStatus)}`);
      router.refresh();
    } catch (err) {
      toast.error(err instanceof Error ? err.message : 'Failed to update status');
    } finally {
      setUpdating(false);
    }
  };

  return (
    <div className="flex items-center gap-2">
      <Select value={currentStatus} onValueChange={handleStatusChange} disabled={updating}>
        <SelectTrigger className="w-[180px]">
          <SelectValue>{formatStatus(currentStatus)}</SelectValue>
        </SelectTrigger>
        <SelectContent>
          <SelectItem value={currentStatus}>
            {formatStatus(currentStatus)} (current)
          </SelectItem>
          {validTransitions.map((status) => (
            <SelectItem key={status} value={status}>
              {formatStatus(status)}
            </SelectItem>
          ))}
        </SelectContent>
      </Select>
      {updating && <Loader2 className="h-4 w-4 animate-spin text-muted-foreground" />}
    </div>
  );
}
