'use client';

import { useRef } from 'react';
import { useUserFormState } from '../hooks/useUserFormState';
import UserFormFields from './UserFormFields';
import UserFormActions from './UserFormActions';
import { Card, CardContent } from '@/components/ui/card';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { useFormErrorFocus } from '@/hooks/use-form-error-focus';

export interface AvailableParent {
  id: string;
  label: string;
}

interface UserFormProps {
  initialData?: {
    id: string | number;
    firstName: string | null;
    lastName: string | null;
    email: string | null;
    username: string | null;
    isAdmin: boolean;
    isTeacher: boolean | null;
    isStudent: boolean | null;
    isParent?: boolean | null;
    isActive: boolean;
    parentId?: string | null;
  };
  isEdit?: boolean;
  availableParents?: AvailableParent[];
}

export default function UserForm({ initialData, isEdit, availableParents = [] }: UserFormProps) {
  const { formData, loading, error, validationErrors, handleChange, handleBlur, handleSubmit, setFormData } =
    useUserFormState(initialData, isEdit);

  const formRef = useRef<HTMLFormElement>(null);
  useFormErrorFocus(validationErrors, formRef);

  const handleParentIdChange = (value: string) => {
    setFormData((prev) => ({ ...prev, parentId: value === '__none__' ? null : value }));
  };

  return (
    <Card className="max-w-2xl mx-auto">
      <CardContent className="p-6">
        <form ref={formRef} onSubmit={handleSubmit} className="space-y-6">
          {error && (
            <Alert variant="destructive">
              <AlertDescription>{error}</AlertDescription>
            </Alert>
          )}
          <UserFormFields
            formData={formData}
            errors={validationErrors}
            onChange={handleChange}
            onBlur={handleBlur}
            availableParents={availableParents}
            onParentIdChange={handleParentIdChange}
          />
          <UserFormActions loading={loading} isEdit={isEdit} />
        </form>
      </CardContent>
    </Card>
  );
}
