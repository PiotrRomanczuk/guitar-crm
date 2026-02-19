/* eslint-disable @typescript-eslint/no-explicit-any */

'use client';

import { useState } from 'react';
import { AssignmentInputSchema } from '@/schemas/AssignmentSchema';
import { z } from 'zod';

interface AssignmentFormData {
  title: string;
  description: string;
  due_date: string;
  status: 'not_started' | 'in_progress' | 'completed' | 'overdue' | 'cancelled';
  student_id: string;
}

interface FieldErrors {
  title?: string;
  description?: string;
  due_date?: string;
  status?: string;
  student_id?: string;
}

interface UseAssignmentFormProps {
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
}

export function useAssignmentForm({ initialData, mode, userId }: UseAssignmentFormProps) {
  const [formData, setFormData] = useState<AssignmentFormData>({
    title: initialData?.title || '',
    description: initialData?.description || '',
    due_date: initialData?.due_date || '',
    status: initialData?.status || 'not_started',
    student_id: initialData?.student_id || userId || '',
  });

  const [touched, setTouched] = useState<Record<string, boolean>>({});
  const [fieldErrors, setFieldErrors] = useState<FieldErrors>({});

  const handleFieldChange = (name: string, value: string) => {
    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }));

    // Clear error when user starts typing
    if (fieldErrors[name as keyof FieldErrors]) {
      setFieldErrors((prev) => ({ ...prev, [name]: undefined }));
    }
  };

  const handleBlur = (field: keyof AssignmentFormData) => {
    setTouched((prev) => ({ ...prev, [field]: true }));

    // Validate single field on blur
    try {
      const fieldValue = formData[field];

      // Skip validation for optional fields
      if (!fieldValue && (field === 'description' || field === 'due_date')) {
        return;
      }

      // Create a minimal schema for this field
      const fieldSchema = AssignmentInputSchema.pick({ [field]: true } as any);
      fieldSchema.parse({ [field]: fieldValue });

      // Clear error if validation passes
      if (fieldErrors[field]) {
        setFieldErrors((prev) => ({ ...prev, [field]: undefined }));
      }
    } catch (err) {
      if (err instanceof z.ZodError) {
        const fieldError = err.issues.find((issue) => issue.path[0] === field);
        if (fieldError) {
          setFieldErrors((prev) => ({
            ...prev,
            [field]: fieldError.message,
          }));
        }
      }
    }
  };

  const validate = (): FieldErrors => {
    const errors: FieldErrors = {};
    const result = AssignmentInputSchema.safeParse({
      ...formData,
      teacher_id: initialData?.teacher_id || userId,
    });

    if (!result.success) {
      for (const issue of result.error.issues) {
        const field = issue.path[0] as keyof FieldErrors;
        if (!errors[field]) {
          errors[field] = issue.message;
        }
      }
    }

    return errors;
  };

  return {
    formData,
    fieldErrors,
    touched,
    handleFieldChange,
    handleBlur,
    validate,
    setFieldErrors,
  };
}
