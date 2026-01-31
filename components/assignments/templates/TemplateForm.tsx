'use client';

import { useRouter } from 'next/navigation';
import { useState } from 'react';
import {
  createAssignmentTemplate,
  updateAssignmentTemplate,
} from '@/app/actions/assignment-templates';
import { AssignmentTemplate } from '@/schemas';

interface TemplateFormProps {
  initialData?: AssignmentTemplate;
  mode: 'create' | 'edit';
  userId: string;
}

export default function TemplateForm({ initialData, mode, userId }: TemplateFormProps) {
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const [formData, setFormData] = useState({
    title: initialData?.title || '',
    description: initialData?.description || '',
  });

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError(null);

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
      router.push('/dashboard/assignments/templates');
      router.refresh();
    } catch (err) {
      console.error(err);
      setError('Failed to save template');
    } finally {
      setLoading(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-6 max-w-2xl">
      {error && <div className="bg-destructive/10 text-destructive p-4 rounded-md">{error}</div>}

      <div className="space-y-2">
        <label htmlFor="title" className="block text-sm font-medium text-foreground">
          Title
        </label>
        <input
          type="text"
          id="title"
          required
          value={formData.title}
          onChange={(e) => setFormData({ ...formData, title: e.target.value })}
          className="block w-full rounded-md border-input shadow-sm focus:border-primary focus:ring-primary sm:text-sm p-2 border bg-background text-foreground"
        />
      </div>

      <div className="space-y-2">
        <label htmlFor="description" className="block text-sm font-medium text-foreground">
          Description
        </label>
        <textarea
          id="description"
          rows={4}
          value={formData.description || ''}
          onChange={(e) => setFormData({ ...formData, description: e.target.value })}
          className="block w-full rounded-md border-input shadow-sm focus:border-primary focus:ring-primary sm:text-sm p-2 border bg-background text-foreground"
        />
      </div>

      <div className="flex justify-end space-x-4">
        <button
          type="button"
          onClick={() => router.back()}
          className="px-4 py-2 text-sm font-medium text-muted-foreground bg-card border border-border rounded-md hover:bg-muted"
        >
          Cancel
        </button>
        <button
          type="submit"
          disabled={loading}
          className="px-4 py-2 text-sm font-medium text-primary-foreground bg-primary rounded-md hover:bg-primary/90 disabled:opacity-50"
        >
          {loading ? 'Saving...' : mode === 'create' ? 'Create Template' : 'Update Template'}
        </button>
      </div>
    </form>
  );
}
