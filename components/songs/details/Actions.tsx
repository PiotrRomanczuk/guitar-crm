'use client';

import Link from 'next/link';
import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Pencil, Trash2 } from 'lucide-react';
import { SyncSpotifyButton } from './SyncSpotifyButton';

interface Props {
  songId: string;
  songTitle?: string;
  hasSpotifyData?: boolean;
  isAdmin?: boolean;
  isTeacher?: boolean;
}

export default function SongDetailActions({
  songId,
  songTitle = '',
  hasSpotifyData = false,
  isAdmin = false,
  isTeacher = false,
}: Props) {
  const [deleting, setDeleting] = useState(false);
  const canManageSongs = isTeacher || isAdmin;

  const handleDelete = async () => {
    if (!confirm('Are you sure you want to delete this song?')) {
      return;
    }

    setDeleting(true);
    try {
      const response = await fetch(`/api/song?id=${songId}`, {
        method: 'DELETE',
      });

      if (!response.ok) {
        throw new Error('Failed to delete song');
      }

      // Optionally reload or redirect
      window.location.href = '/dashboard/songs';
    } catch (error) {
      console.error('Delete error:', error);
      alert('Failed to delete song');
      setDeleting(false);
    }
  };

  if (!canManageSongs) {
    return null;
  }

  return (
    <div className="flex flex-wrap gap-3">
      <SyncSpotifyButton songId={songId} songTitle={songTitle} hasSpotifyData={hasSpotifyData} />

      <Button asChild variant="outline">
        <Link href={`/dashboard/songs/${songId}/edit`}>
          <Pencil className="w-4 h-4 mr-2" />
          Edit Song
        </Link>
      </Button>

      <Button variant="destructive" onClick={handleDelete} disabled={deleting}>
        <Trash2 className="w-4 h-4 mr-2" />
        {deleting ? 'Deleting...' : 'Delete Song'}
      </Button>
    </div>
  );
}
