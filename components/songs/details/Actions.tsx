'use client';

import Link from 'next/link';
import { useState } from 'react';
import { Button } from '@/components/ui/button';
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from '@/components/ui/alert-dialog';
import { Pencil, Trash2 } from 'lucide-react';
import { SyncSpotifyButton } from './SyncSpotifyButton';
import { toast } from 'sonner';

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
  const [dialogOpen, setDialogOpen] = useState(false);
  const canManageSongs = isTeacher || isAdmin;

  const handleDelete = async () => {
    setDeleting(true);
    try {
      const response = await fetch(`/api/song?id=${songId}`, {
        method: 'DELETE',
      });

      if (!response.ok) {
        throw new Error('Failed to delete song');
      }

      window.location.href = '/dashboard/songs';
    } catch (error) {
      console.error('Delete error:', error);
      toast.error('Failed to delete song');
      setDeleting(false);
      setDialogOpen(false);
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

      <AlertDialog open={dialogOpen} onOpenChange={setDialogOpen}>
        <AlertDialogTrigger asChild>
          <Button variant="destructive" disabled={deleting}>
            <Trash2 className="w-4 h-4 mr-2" />
            {deleting ? 'Deleting...' : 'Delete Song'}
          </Button>
        </AlertDialogTrigger>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Delete Song</AlertDialogTitle>
            <AlertDialogDescription>
              Are you sure you want to delete this song? This action cannot be undone.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction onClick={handleDelete} className="bg-destructive text-destructive-foreground hover:bg-destructive/90">
              Delete
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}
