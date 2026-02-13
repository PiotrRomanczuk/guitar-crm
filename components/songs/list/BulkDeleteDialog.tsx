'use client';

import { AlertTriangle, Loader2 } from 'lucide-react';
import {
  AlertDialog,
  AlertDialogContent,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogCancel,
  AlertDialogAction,
} from '@/components/ui/alert-dialog';
import { Alert, AlertDescription } from '@/components/ui/alert';

interface BulkDeleteDialogProps {
  isOpen: boolean;
  count: number;
  onConfirm: () => void;
  onClose: () => void;
  isDeleting?: boolean;
  error?: string | null;
}

export default function BulkDeleteDialog({
  isOpen,
  count,
  onConfirm,
  onClose,
  isDeleting = false,
  error,
}: BulkDeleteDialogProps) {
  return (
    <AlertDialog open={isOpen} onOpenChange={(open) => !open && onClose()}>
      <AlertDialogContent>
        <AlertDialogHeader>
          <div className="flex items-center gap-4">
            <div className="shrink-0 w-12 h-12 bg-destructive/10 rounded-full flex items-center justify-center">
              <AlertTriangle className="w-6 h-6 text-destructive" />
            </div>
            <AlertDialogTitle>
              Delete {count} {count === 1 ? 'Song' : 'Songs'}
            </AlertDialogTitle>
          </div>
          <AlertDialogDescription>
            Are you sure you want to delete{' '}
            <strong>{count} {count === 1 ? 'song' : 'songs'}</strong>? This
            action cannot be undone.
          </AlertDialogDescription>
        </AlertDialogHeader>

        {error && (
          <Alert variant="destructive">
            <AlertDescription>{error}</AlertDescription>
          </Alert>
        )}

        <div className="bg-warning/10 border border-warning/20 rounded-md p-4">
          <div className="flex">
            <AlertTriangle className="h-5 w-5 text-warning shrink-0" />
            <div className="ml-3">
              <h4 className="text-sm font-medium text-warning">
                Related data will be removed
              </h4>
              <p className="mt-1 text-sm text-warning/80">
                All lesson assignments and favorites associated with these songs
                will be permanently removed.
              </p>
            </div>
          </div>
        </div>

        <AlertDialogFooter>
          <AlertDialogCancel disabled={isDeleting}>Cancel</AlertDialogCancel>
          <AlertDialogAction
            onClick={onConfirm}
            disabled={isDeleting}
            className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
          >
            {isDeleting && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
            {isDeleting
              ? 'Deleting...'
              : `Delete ${count} ${count === 1 ? 'Song' : 'Songs'}`}
          </AlertDialogAction>
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
  );
}
