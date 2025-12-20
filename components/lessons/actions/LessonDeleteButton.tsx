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

        router.push('/dashboard/lessons');
        router.refresh();
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
      className="px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 disabled:opacity-50 disabled:cursor-not-allowed"
      data-testid="lesson-delete-button"
    >
      {isPending ? 'Deleting...' : 'Delete'}
    </button>
  );
}
