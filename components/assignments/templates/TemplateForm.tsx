'use client';

import { useRouter } from 'next/navigation';
import { useState } from 'react';
import {
  createAssignmentTemplate,
  updateAssignmentTemplate,
} from '@/app/actions/assignment-templates';
import { AssignmentTemplate } from '@/schemas';
import { useTemplateForm } from './useTemplateForm';
import { Label } from '@/components/ui/label';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Button } from '@/components/ui/button';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { AlertCircle } from 'lucide-react';

interface TemplateFormProps {
  initialData?: AssignmentTemplate;
  mode: 'create' | 'edit';
  userId: string;
}

export default function TemplateForm({ initialData, mode, userId }: TemplateFormProps) {
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
  } = useTemplateForm(initialData?.title || '', initialData?.description || '');

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError(null);

    // Validate all fields
    const errors = validate(userId);
    if (Object.keys(errors).length > 0) {
      setFieldErrors(errors);
      setError('Please fix the validation errors');
      setLoading(false);
      return;
    }

    try {
      if (mode === 'create') {
        await createAssignmentTemplate({
          title: formData.title,
          description: formData.description,
          teacher_id: userId,
        });
      } else {
        if (!initialData?.id) return;
        await updateAssignmentTemplate({
          id: initialData.id,
          title: formData.title,
          description: formData.description,
          teacher_id: userId,
        });
      }
      // Navigate to templates list - router.push already refreshes the target page
      router.push('/dashboard/assignments/templates');
    } catch (err) {
      console.error(err);
      setError('Failed to save template');
    } finally {
      setLoading(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-6 max-w-2xl">
      {error && (
        <Alert variant="destructive">
          <AlertCircle className="h-4 w-4" />
          <AlertDescription>{error}</AlertDescription>
        </Alert>
      )}

      <div className="space-y-2">
        <Label htmlFor="title">
          Title <span className="text-destructive">*</span>
        </Label>
        <Input
          type="text"
          id="title"
          required
          value={formData.title}
          onChange={(e) => handleFieldChange('title', e.target.value)}
          onBlur={() => handleBlur('title')}
          placeholder="Template title"
          aria-invalid={!!fieldErrors.title}
        />
        {fieldErrors.title && (
          <p className="text-sm text-destructive" role="alert">
            {fieldErrors.title}
          </p>
        )}
      </div>

      <div className="space-y-2">
        <Label htmlFor="description">Description</Label>
        <Textarea
          id="description"
          rows={4}
          value={formData.description || ''}
          onChange={(e) => handleFieldChange('description', e.target.value)}
          onBlur={() => handleBlur('description')}
          placeholder="Template description (optional)"
          aria-invalid={!!fieldErrors.description}
        />
        {fieldErrors.description && (
          <p className="text-sm text-destructive" role="alert">
            {fieldErrors.description}
          </p>
        )}
      </div>

      <div className="flex justify-end gap-4">
        <Button type="button" variant="outline" onClick={() => router.back()}>
          Cancel
        </Button>
        <Button type="submit" disabled={loading}>
          {loading ? 'Saving...' : mode === 'create' ? 'Create Template' : 'Update Template'}
        </Button>
      </div>
    </form>
  );
}
