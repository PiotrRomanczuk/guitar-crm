import { Badge } from '@/components/ui/badge';

const STATUS_CONFIG: Record<string, { label: string; variant: 'secondary' | 'completed' | 'destructive' }> = {
  pending: { label: 'Pending', variant: 'secondary' },
  approved: { label: 'Approved', variant: 'completed' },
  rejected: { label: 'Rejected', variant: 'destructive' },
};

interface SongRequestStatusBadgeProps {
  status: string;
}

export function SongRequestStatusBadge({ status }: SongRequestStatusBadgeProps) {
  const config = STATUS_CONFIG[status] ?? STATUS_CONFIG.pending;

  return (
    <Badge variant={config.variant} className="ml-2 shrink-0">
      {config.label}
    </Badge>
  );
}
