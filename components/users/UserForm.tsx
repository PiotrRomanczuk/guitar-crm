'use client';

import { useUserFormState } from './useUserFormState';
import UserFormFields from './UserFormFields';
import UserFormActions from './UserFormActions';

interface UserFormProps {
  initialData?: {
    id: number;
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
  const { formData, loading, error, handleChange, handleSubmit } = useUserFormState(
    initialData,
    isEdit
  );

  return (
    <div className="max-w-2xl mx-auto">
      <form
        onSubmit={handleSubmit}
        className="space-y-6 bg-white dark:bg-gray-800 rounded-lg shadow-md p-6"
      >
        {error && (
          <div className="bg-red-100 dark:bg-red-900/30 border border-red-400 dark:border-red-700 text-red-800 dark:text-red-300 px-4 py-3 rounded-lg">
            {error}
          </div>
        )}
        <UserFormFields formData={formData} onChange={handleChange} />
        <UserFormActions loading={loading} isEdit={isEdit} />
      </form>
    </div>
  );
}
