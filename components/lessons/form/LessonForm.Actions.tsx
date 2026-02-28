import FormActions from '@/components/shared/FormActions';

interface Props {
  isSubmitting: boolean;
  onCancel: () => void;
  isEditing?: boolean;
}

export function LessonFormActions({ isSubmitting, onCancel, isEditing = false }: Props) {
  return (
    <div className="pt-2 sm:pt-4" data-testid="lesson-submit-wrapper">
      <FormActions
        isSubmitting={isSubmitting}
        onCancel={onCancel}
        showCancel
        submitText={isEditing ? 'Save Changes' : 'Create Lesson'}
        submittingText={isEditing ? 'Saving...' : 'Creating...'}
      />
    </div>
  );
}
