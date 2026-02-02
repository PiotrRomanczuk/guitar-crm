'use client';

import { useUserFormState } from '../hooks/useUserFormState';
import UserFormFields from './UserFormFields';
import UserFormActions from './UserFormActions';
import { Card, CardContent } from '@/components/ui/card';
import { Alert, AlertDescription } from '@/components/ui/alert';

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
    isActive: boolean;
  };
  isEdit?: boolean;
}

export default function UserForm({ initialData, isEdit }: UserFormProps) {
  const { formData, loading, error, validationErrors, handleChange, handleBlur, handleSubmit } = useUserFormState(
    initialData,
    isEdit
  );

  return (
    <Card className="max-w-2xl mx-auto">
      <CardContent className="p-6">
        <form onSubmit={handleSubmit} className="space-y-6">
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
          />
          <UserFormActions loading={loading} isEdit={isEdit} />
        </form>
      </CardContent>
    </Card>
  );
}
