import FormActions from '@/components/shared/FormActions';

interface Props {
  isSubmitting: boolean;
  onCancel: () => void;
}

export function LessonFormActions({ isSubmitting, onCancel }: Props) {
  return (
    <div className="pt-2 sm:pt-4" data-testid="lesson-submit-wrapper">
      <FormActions
        isSubmitting={isSubmitting}
        onCancel={onCancel}
        showCancel
        submitText="Create Lesson"
        submittingText="Creating..."
      />
    </div>
  );
}
