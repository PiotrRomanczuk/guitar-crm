import FormActions from '@/components/shared/FormActions';

interface AssignmentFormActionsProps {
  mode: 'create' | 'edit';
  loading: boolean;
}

export function AssignmentFormActions({ mode, loading }: AssignmentFormActionsProps) {
  const submitText = mode === 'create' ? 'Create' : 'Update';

  return (
    <div className="pt-4" data-testid="assignment-form-actions">
      <FormActions
        isSubmitting={loading}
        submitText={submitText}
        submittingText="Saving..."
        cancelHref="/dashboard/assignments"
        showCancel
        layout="horizontal"
      />
    </div>
  );
}
