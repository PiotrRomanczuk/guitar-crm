import { useState } from 'react';
import { getSupabaseBrowserClient } from '@/lib/supabase-browser';

export function useSongDelete(onSuccess?: () => void) {
  const [isDeleting, setIsDeleting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const deleteSong = async (songId: string) => {
    setIsDeleting(true);
    setError(null);

    try {
      const supabase = getSupabaseBrowserClient();
      const { error: deleteError } = await supabase.from('songs').delete().eq('id', songId);

      if (deleteError) {
        throw new Error(deleteError.message);
      }

      onSuccess?.();
    } catch (err) {
      console.error('🎸 [FRONTEND] Delete failed:', err);
      setError(err instanceof Error ? err.message : 'Failed to delete song');
    } finally {
      setIsDeleting(false);
    }
  };

  return {
    deleteSong,
    isDeleting,
    error,
  };
}
