'use client';

import { useState } from 'react';
import { AssignmentTemplateInputSchema } from '@/schemas/AssignmentTemplateSchema';
import { z } from 'zod';

interface TemplateFormData {
  title: string;
  description: string;
}

interface FieldErrors {
  title?: string;
  description?: string;
}

export function useTemplateForm(initialTitle = '', initialDescription = '') {
  const [formData, setFormData] = useState<TemplateFormData>({
    title: initialTitle,
    description: initialDescription,
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

  const handleBlur = (field: keyof TemplateFormData) => {
    setTouched((prev) => ({ ...prev, [field]: true }));

    // Validate single field on blur
    try {
      const fieldValue = formData[field];

      // Skip validation for optional description field
      if (!fieldValue && field === 'description') {
        return;
      }

      // Create a minimal schema for this field (need to add teacher_id for validation)
      const fieldSchema = AssignmentTemplateInputSchema.pick({ [field]: true } as any);
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

  const validate = (teacherId: string): FieldErrors => {
    const errors: FieldErrors = {};
    const result = AssignmentTemplateInputSchema.safeParse({
      ...formData,
      teacher_id: teacherId,
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
    setFormData,
  };
}
