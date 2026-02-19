'use client';

import { Trash2, X } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';

interface BulkActionBarProps {
  selectedCount: number;
  onDelete: () => void;
  onClear: () => void;
  isDeleting?: boolean;
}

export default function BulkActionBar({
  selectedCount,
  onDelete,
  onClear,
  isDeleting = false,
}: BulkActionBarProps) {
  if (selectedCount === 0) return null;

  return (
    <div className="sticky top-0 z-10 flex items-center justify-between gap-3 rounded-lg border border-border bg-card p-3 shadow-sm">
      <div className="flex items-center gap-2">
        <Badge variant="secondary" className="text-sm">
          {selectedCount}
        </Badge>
        <span className="text-sm text-muted-foreground">
          {selectedCount === 1 ? 'song' : 'songs'} selected
        </span>
      </div>

      <div className="flex items-center gap-2">
        <Button
          variant="ghost"
          size="sm"
          onClick={onClear}
          disabled={isDeleting}
        >
          <X className="mr-1 h-4 w-4" />
          Clear
        </Button>
        <Button
          variant="destructive"
          size="sm"
          onClick={onDelete}
          disabled={isDeleting}
        >
          <Trash2 className="mr-1 h-4 w-4" />
          Delete Selected
        </Button>
      </div>
    </div>
  );
}
