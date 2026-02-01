import { Loader2 } from 'lucide-react';
import { Button } from '@/components/ui/button';

/**
 * Assignment Form Actions
 * Standardized per CLAUDE.md Form Standards (Section 10)
 */

interface AssignmentFormActionsProps {
  mode: 'create' | 'edit';
  loading: boolean;
  onCancel?: () => void;
}

export function AssignmentFormActions({ mode, loading, onCancel }: AssignmentFormActionsProps) {
  return (
    <div className="flex flex-col-reverse sm:flex-row gap-3 pt-4 border-t border-border">
      <Button type="submit" disabled={loading} data-testid="submit-button">
        {loading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
        {loading ? 'Saving...' : mode === 'create' ? 'Create' : 'Update'}
      </Button>
      {onCancel && (
        <Button type="button" variant="outline" onClick={onCancel} disabled={loading}>
          Cancel
        </Button>
      )}
    </div>
  );
}
