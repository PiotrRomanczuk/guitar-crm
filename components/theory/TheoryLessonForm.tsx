'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Switch } from '@/components/ui/switch';
import { createTheoryLesson, updateTheoryLesson } from '@/app/dashboard/theory/actions';

interface TheoryLessonFormProps {
  courseId: string;
  mode: 'create' | 'edit';
  lessonId?: string;
  defaultValues?: {
    title: string;
    content: string;
    excerpt: string;
    is_published: boolean;
  };
}

export function TheoryLessonForm({ courseId, mode, lessonId, defaultValues }: TheoryLessonFormProps) {
  const router = useRouter();
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const [title, setTitle] = useState(defaultValues?.title ?? '');
  const [content, setContent] = useState(defaultValues?.content ?? '');
  const [excerpt, setExcerpt] = useState(defaultValues?.excerpt ?? '');
  const [isPublished, setIsPublished] = useState(defaultValues?.is_published ?? false);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setIsSubmitting(true);
    setError(null);

    const input = {
      title,
      content,
      excerpt: excerpt || undefined,
      is_published: isPublished,
    };

    const result =
      mode === 'create'
        ? await createTheoryLesson(courseId, input)
        : await updateTheoryLesson(lessonId!, courseId, input);

    setIsSubmitting(false);

    if (!result.success) {
      setError(result.error ?? 'Something went wrong');
      return;
    }

    if (mode === 'create' && 'lessonId' in result) {
      router.push(`/dashboard/theory/${courseId}/${result.lessonId}`);
    } else {
      router.push(`/dashboard/theory/${courseId}/${lessonId}`);
    }
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-6 max-w-3xl">
      {error && (
        <div className="p-3 rounded-md bg-destructive/10 text-destructive text-sm">{error}</div>
      )}

      <div className="space-y-2">
        <Label htmlFor="title">Chapter Title</Label>
        <Input
          id="title"
          value={title}
          onChange={(e) => setTitle(e.target.value)}
          placeholder="e.g. Understanding Intervals"
          required
        />
      </div>

      <div className="space-y-2">
        <Label htmlFor="excerpt">Excerpt (optional)</Label>
        <Input
          id="excerpt"
          value={excerpt}
          onChange={(e) => setExcerpt(e.target.value)}
          placeholder="Short preview shown in chapter list"
        />
      </div>

      <div className="space-y-2">
        <Label htmlFor="content">Content (Markdown)</Label>
        <Textarea
          id="content"
          value={content}
          onChange={(e) => setContent(e.target.value)}
          placeholder="Write your chapter content here using Markdown..."
          rows={20}
          className="font-mono text-sm"
        />
      </div>

      <div className="flex items-center gap-3">
        <Switch id="published" checked={isPublished} onCheckedChange={setIsPublished} />
        <Label htmlFor="published">Publish chapter</Label>
      </div>

      <div className="flex gap-3">
        <Button type="submit" disabled={isSubmitting}>
          {isSubmitting ? 'Saving...' : mode === 'create' ? 'Create Chapter' : 'Save Changes'}
        </Button>
        <Button type="button" variant="outline" onClick={() => router.back()}>
          Cancel
        </Button>
      </div>
    </form>
  );
}
