'use client';

import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { RefreshCw } from 'lucide-react';
import { toast } from 'sonner';
import { useRouter } from 'next/navigation';

export function SyncSpotifyButton() {
  const [isLoading, setIsLoading] = useState(false);
  const router = useRouter();

  const handleSync = async () => {
    setIsLoading(true);
    try {
      const response = await fetch('/api/spotify/sync', {
        method: 'POST',
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || 'Failed to sync');
      }

      toast.success(
        `Synced ${data.updated} songs. Skipped ${data.skipped}. Failed ${data.failed}.`
      );
      router.refresh();
    } catch (error: any) {
      toast.error(error.message);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <Button variant="outline" onClick={handleSync} disabled={isLoading} className="gap-2">
      <RefreshCw className={`w-4 h-4 ${isLoading ? 'animate-spin' : ''}`} />
      {isLoading ? 'Syncing...' : 'Sync Spotify'}
    </Button>
  );
}
