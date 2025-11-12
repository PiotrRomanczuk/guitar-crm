'use client';

import { useState } from 'react';
import { LessonInputSchema } from '@/schemas/LessonSchema';
import { z } from 'zod';
import { useProfiles } from './useProfiles';

interface FormData {
  student_id: string;
  teacher_id: string;
  scheduled_at: string; // ISO datetime string (e.g., "2025-11-12T14:30")
  notes?: string;
}

interface ValidationErrors {
  [key: string]: string;
}

export default function useLessonForm() {
  const [formData, setFormData] = useState<FormData>({
    student_id: '',
    teacher_id: '',
    scheduled_at: '',
    notes: '',
  });

  const [error, setError] = useState<string | null>(null);
  const [validationErrors, setValidationErrors] = useState<ValidationErrors>({});

  // Use extracted profiles hook
  const { students, teachers, loading, error: profilesError } = useProfiles();

  const handleChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>
  ) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));

    // Clear validation error for this field
    if (validationErrors[name]) {
      setValidationErrors((prev) => {
        const newErrors = { ...prev };
        delete newErrors[name];
        return newErrors;
      });
    }
  };

  const handleSubmit = async () => {
    try {
      console.log('[useLessonForm] handleSubmit called with formData:', formData);
      setError(null);
      setValidationErrors({});

      console.log('[useLessonForm] Validating with LessonInputSchema...');
      const validatedData = LessonInputSchema.parse(formData);
      console.log('[useLessonForm] Validation passed! Data:', validatedData);

      console.log('[useLessonForm] Making POST request to /api/lessons...');
      const response = await fetch('/api/lessons', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(validatedData),
      });

      console.log('[useLessonForm] Response status:', response.status);

      if (!response.ok) {
        const errorData = await response.json();
        console.error('[useLessonForm] API error:', errorData);
        throw new Error(errorData.error || 'Failed to create lesson');
      }

      const responseData = await response.json();
      console.log('[useLessonForm] Success! Response data:', responseData);
      return { success: true };
    } catch (err) {
      console.error('[useLessonForm] Error in handleSubmit:', err);
      if (err instanceof z.ZodError) {
        const errors: ValidationErrors = {};
        err.errors.forEach((e) => {
          errors[e.path[0] as string] = e.message;
        });
        console.error('[useLessonForm] Validation errors:', errors);
        setValidationErrors(errors);
      } else {
        const errorMsg = err instanceof Error ? err.message : 'An error occurred';
        console.error('[useLessonForm] Setting error:', errorMsg);
        setError(errorMsg);
      }
      return { success: false };
    }
  };

  return {
    formData,
    students,
    teachers,
    loading,
    error: error || profilesError,
    validationErrors,
    handleChange,
    handleSubmit,
  };
}
