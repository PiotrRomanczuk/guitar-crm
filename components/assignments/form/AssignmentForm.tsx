'use client';

import { useRouter } from 'next/navigation';
import { useState } from 'react';
import Link from 'next/link';
import { Dispatch, SetStateAction } from 'react';
import { AssignmentFormFields } from './AssignmentForm.Fields';
import { AssignmentFormActions } from './AssignmentForm.Actions';
import { useAssignmentForm } from './useAssignmentForm';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { AlertCircle } from 'lucide-react';

interface Student {
  id: string;
  full_name: string | null;
  email: string | null;
}

interface AssignmentFormProps {
  initialData?: {
    id: string;
    title: string;
    description: string | null;
    due_date: string | null;
    status: 'not_started' | 'in_progress' | 'completed' | 'overdue' | 'cancelled';
    teacher_id: string;
    student_id: string;
  };
  mode: 'create' | 'edit';
  userId?: string;
  students?: Student[];
}

export default function AssignmentForm({
  initialData,
  mode,
  userId,
  students = [],
}: AssignmentFormProps) {
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const {
    formData,
    fieldErrors,
    handleFieldChange,
    handleBlur,
    validate,
    setFieldErrors,
  } = useAssignmentForm({ initialData, mode, userId });

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);

    // Validate all fields
    const errors = validate();
    if (Object.keys(errors).length > 0) {
      setFieldErrors(errors);
      setError('Please fix the validation errors');
      return;
    }

    await submitAssignment(formData, mode, initialData?.id, router, setLoading, setError);
  };

  return (
    <div className="container mx-auto px-4 py-8">
      <Link
        href="/dashboard/assignments"
        className="text-primary hover:underline mb-6 inline-block"
      >
        ← Back to assignments
      </Link>

      <div className="bg-card rounded-lg shadow-md p-8 max-w-2xl">
        <h1 className="text-2xl font-bold text-foreground mb-6">
          {mode === 'create' ? 'Create Assignment' : 'Edit Assignment'}
        </h1>

        <form onSubmit={handleSubmit} className="space-y-6">
          {error && (
            <Alert variant="destructive">
              <AlertCircle className="h-4 w-4" />
              <AlertDescription>{error}</AlertDescription>
            </Alert>
          )}

          <AssignmentFormFields
            formData={formData}
            fieldErrors={fieldErrors}
            onChange={handleFieldChange}
            onBlur={handleBlur}
            students={students}
            selectedStudent={students.find((s) => s.id === formData.student_id)}
            recentSongs={['Wonderwall', 'Hotel California']} // TODO: Fetch actual recent songs
            lessonTopic="Practice assignment"
          />
          <AssignmentFormActions mode={mode} loading={loading} />
        </form>
      </div>
    </div>
  );
}

async function submitAssignment(
  formData: {
    title: string;
    description: string;
    due_date: string;
    status: string;
    student_id: string;
  },
  mode: string,
  id: string | undefined,
  router: ReturnType<typeof useRouter>,
  setLoading: Dispatch<SetStateAction<boolean>>,
  setError: Dispatch<SetStateAction<string | null>>
) {
  setLoading(true);
  setError(null);

  try {
    const url = mode === 'create' ? '/api/assignments' : `/api/assignments/${id}`;
    const method = mode === 'create' ? 'POST' : 'PUT';

    const response = await fetch(url, {
      method,
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(formData),
    });

    if (!response.ok) {
      const errorData = await response.json();
      throw new Error(errorData.error || 'Failed to save assignment');
    }

    const data = await response.json();
    router.push(`/dashboard/assignments/${data.id}`);
  } catch (err) {
    setError(err instanceof Error ? err.message : 'An error occurred');
  } finally {
    setLoading(false);
  }
}
