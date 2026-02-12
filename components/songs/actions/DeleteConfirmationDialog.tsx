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

interface DeleteConfirmationDialogProps {
  isOpen: boolean;
  onClose: () => void;
  onConfirm: () => void;
  songTitle: string;
  hasLessonAssignments: boolean;
  lessonCount?: number;
  favoriteCount?: number;
  isDeleting?: boolean;
  error?: string | null;
}

export default function DeleteConfirmationDialog({
  isOpen,
  onClose,
  onConfirm,
  songTitle,
  hasLessonAssignments,
  lessonCount = 0,
  favoriteCount = 0,
  isDeleting = false,
  error,
}: DeleteConfirmationDialogProps) {
  return (
    <AlertDialog open={isOpen} onOpenChange={(open) => !open && onClose()}>
      <AlertDialogContent data-testid="delete-confirmation-dialog">
        <AlertDialogHeader>
          <div className="flex items-center gap-4">
            <div className="shrink-0 w-12 h-12 bg-destructive/10 rounded-full flex items-center justify-center">
              <AlertTriangle className="w-6 h-6 text-destructive" />
            </div>
            <AlertDialogTitle data-testid="delete-confirmation-title">
              Delete Song
            </AlertDialogTitle>
          </div>
          <AlertDialogDescription>
            Are you sure you want to delete <strong>&ldquo;{songTitle}&rdquo;</strong>? This action
            cannot be undone.
          </AlertDialogDescription>
        </AlertDialogHeader>

        {error && (
          <Alert variant="destructive" data-testid="delete-error">
            <AlertDescription>{error}</AlertDescription>
          </Alert>
        )}

        {hasLessonAssignments && (
          <div className="bg-warning/10 border border-warning/20 rounded-md p-4">
            <div className="flex">
              <AlertTriangle className="h-5 w-5 text-warning shrink-0" />
              <div className="ml-3">
                <h4 className="text-sm font-medium text-warning">
                  Related assignments will be removed
                </h4>
                <div className="mt-2 text-sm text-warning/80">
                  <ul className="list-disc list-inside space-y-1">
                    {lessonCount > 0 && (
                      <li>{lessonCount} lesson assignment(s) will be removed</li>
                    )}
                    {favoriteCount > 0 && (
                      <li>{favoriteCount} user favorite(s) will be removed</li>
                    )}
                  </ul>
                </div>
              </div>
            </div>
          </div>
        )}

        <AlertDialogFooter>
          <AlertDialogCancel
            disabled={isDeleting}
            data-testid="delete-cancel-button"
          >
            Cancel
          </AlertDialogCancel>
          <AlertDialogAction
            onClick={onConfirm}
            disabled={isDeleting}
            className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
            data-testid="delete-confirm-button"
          >
            {isDeleting && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
            {isDeleting ? 'Deleting...' : 'Delete Song'}
          </AlertDialogAction>
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
  );
}
