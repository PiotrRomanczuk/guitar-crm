'use client';

import { useState } from 'react';
import { Music, Plus } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { SongRequestDialog } from './SongRequestDialog';
import { SongRequestList } from './SongRequestList';

/**
 * Student-facing button to request a song + view past requests.
 * Renders a "Request a Song" button and a collapsible list of previous requests.
 */
export function SongRequestButton() {
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [refreshKey, setRefreshKey] = useState(0);

  const handleSuccess = () => {
    setRefreshKey((k) => k + 1);
  };

  return (
    <div className="space-y-4">
      <Button
        onClick={() => setIsDialogOpen(true)}
        variant="outline"
        className="gap-2"
      >
        <Plus className="h-4 w-4" />
        <Music className="h-4 w-4" />
        Request a Song
      </Button>

      <SongRequestDialog
        isOpen={isDialogOpen}
        onClose={() => setIsDialogOpen(false)}
        onSuccess={handleSuccess}
      />

      <SongRequestList refreshKey={refreshKey} />
    </div>
  );
}
