import { Button } from '@/components/ui/button';
import { Loader2 } from 'lucide-react';

interface Props {
  isSubmitting: boolean;
  onCancel: () => void;
}

export function LessonFormActions({ isSubmitting, onCancel }: Props) {
  return (
    <div className="flex flex-col-reverse sm:flex-row gap-3 pt-4 border-t border-border">
      <Button
        type="button"
        onClick={onCancel}
        disabled={isSubmitting}
        variant="outline"
        className="w-full sm:w-auto"
      >
        Cancel
      </Button>
      <Button
        type="submit"
        disabled={isSubmitting}
        data-testid="lesson-submit"
        className="w-full sm:flex-1"
      >
        {isSubmitting && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
        {isSubmitting ? 'Creating...' : 'Create Lesson'}
      </Button>
    </div>
  );
}
