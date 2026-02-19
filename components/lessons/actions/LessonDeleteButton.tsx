'use client';

import { useTransition } from 'react';
import { useRouter } from 'next/navigation';

interface Props {
  lessonId: string;
}

export default function LessonDeleteButton({ lessonId }: Props) {
  const router = useRouter();
  const [isPending, startTransition] = useTransition();

  const handleDelete = async () => {
    if (!confirm('Are you sure you want to delete this lesson?')) {
      return;
    }

    startTransition(async () => {
      try {
        const response = await fetch(`/api/lessons/${lessonId}`, {
          method: 'DELETE',
        });

        if (!response.ok) {
          throw new Error('Failed to delete lesson');
        }

        // Navigate to lessons list - router.push already refreshes the target page
        router.push('/dashboard/lessons');
      } catch (error) {
        console.error('Error deleting lesson:', error);
        alert('Failed to delete lesson');
      }
    });
  };

  return (
    <button
      type="button"
      onClick={handleDelete}
      disabled={isPending}
      className="px-4 py-2 bg-destructive text-destructive-foreground rounded-lg hover:bg-destructive/90 disabled:opacity-50 disabled:cursor-not-allowed"
      data-testid="lesson-delete-button"
    >
      {isPending ? 'Deleting...' : 'Delete'}
    </button>
  );
}
