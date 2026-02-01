'use client';

import { useRouter } from 'next/navigation';
import FormActions from '@/components/shared/FormActions';

interface UserFormActionsProps {
  loading: boolean;
  isEdit?: boolean;
  onCancel?: () => void;
}

export default function UserFormActions({ loading, isEdit, onCancel }: UserFormActionsProps) {
  const router = useRouter();
  const submitText = isEdit ? 'Update User' : 'Create User';

  const handleCancel = onCancel ?? (() => router.back());

  return (
    <div className="pt-4 border-t border-gray-200 dark:border-gray-700" data-testid="user-form-actions">
      <FormActions
        isSubmitting={loading}
        submitText={submitText}
        submittingText="Saving..."
        onCancel={handleCancel}
        showCancel
        layout="horizontal"
      />
    </div>
  );
}
