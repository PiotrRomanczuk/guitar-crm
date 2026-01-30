'use client';

import { useRouter } from 'next/navigation';
import { useState } from 'react';
import { Loader2 } from 'lucide-react';
import { AssignmentFormFields } from './AssignmentForm.Fields';
import { FormWrapper, FormActions } from '@/components/ui/form-wrapper';
import { Button } from '@/components/ui/button';

/**
 * Assignment Form
 * Standardized per CLAUDE.md Form Standards (Section 10)
 */

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

  const [formData, setFormData] = useState({
    title: initialData?.title || '',
    description: initialData?.description || '',
    due_date: initialData?.due_date || '',
    status: initialData?.status || 'not_started',
    student_id: initialData?.student_id || userId || '',
  });

  const handleFieldChange = (name: string, value: string) => {
    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }));
    if (error) setError(null);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError(null);

    try {
      const url = mode === 'create' ? '/api/assignments' : `/api/assignments/${initialData?.id}`;
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
  };

  const handleCancel = () => {
    router.push('/dashboard/assignments');
  };

  return (
    <div className="container mx-auto px-4 py-8 max-w-2xl">
      <FormWrapper
        title={mode === 'create' ? 'Create Assignment' : 'Edit Assignment'}
        error={error}
      >
        <form onSubmit={handleSubmit} className="space-y-6">
          <AssignmentFormFields
            formData={formData}
            onChange={handleFieldChange}
            students={students}
            selectedStudent={students.find((s) => s.id === formData.student_id)}
            recentSongs={['Wonderwall', 'Hotel California']}
            lessonTopic="Practice assignment"
          />

          <FormActions>
            <Button type="submit" disabled={loading} data-testid="submit-button">
              {loading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
              {loading ? 'Saving...' : mode === 'create' ? 'Create' : 'Update'}
            </Button>
            <Button
              type="button"
              variant="outline"
              onClick={handleCancel}
              disabled={loading}
            >
              Cancel
            </Button>
          </FormActions>
        </form>
      </FormWrapper>
    </div>
  );
}
