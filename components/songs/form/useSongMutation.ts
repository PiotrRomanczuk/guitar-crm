import { useState } from 'react';

interface UseSongMutationProps {
  mode: 'create' | 'edit';
  songId?: string;
  onSuccess?: () => void;
}

export function useSongMutation({ mode, songId, onSuccess }: UseSongMutationProps) {
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submitError, setSubmitError] = useState<string | null>(null);

  const saveSong = async (data: unknown) => {
    setIsSubmitting(true);
    setSubmitError(null);

    try {
      const endpoint = mode === 'create' ? '/api/song' : `/api/song?id=${songId}`;
      const method = mode === 'create' ? 'POST' : 'PUT';

      const res = await fetch(endpoint, {
        method,
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(data),
      });

      if (!res.ok) {
        const json = await res.json().catch(() => ({}));
        throw new Error(json.error || `Request failed: ${res.status}`);
      }

      onSuccess?.();
      return { error: null };
    } catch (e) {
      const message = e instanceof Error ? e.message : 'Network error';
      setSubmitError(message);
      return { error: e instanceof Error ? e : new Error(message) };
    } finally {
      setIsSubmitting(false);
    }
  };

  return {
    isSubmitting,
    submitError,
    saveSong,
    setSubmitError, // Expose this in case the component needs to set validation errors manually or clear errors
  };
}
