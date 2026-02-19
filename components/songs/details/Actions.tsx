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
} from '@/components/ui/alert-dialog';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { Pencil, Trash2, MoreVertical } from 'lucide-react';
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
    <div className="flex items-center gap-2">
      <SyncSpotifyButton songId={songId} songTitle={songTitle} hasSpotifyData={hasSpotifyData} />

      <Button asChild variant="outline" className="hidden sm:flex">
        <Link href={`/dashboard/songs/${songId}/edit`}>
          <Pencil className="w-4 h-4 mr-2" />
          Edit
        </Link>
      </Button>

      <Button asChild variant="outline" size="icon" className="sm:hidden">
        <Link href={`/dashboard/songs/${songId}/edit`}>
          <Pencil className="w-4 h-4" />
        </Link>
      </Button>

      <DropdownMenu>
        <DropdownMenuTrigger asChild>
          <Button variant="ghost" size="icon" className="shrink-0 text-muted-foreground hover:text-foreground">
            <MoreVertical className="w-5 h-5" />
            <span className="sr-only">More options</span>
          </Button>
        </DropdownMenuTrigger>
        <DropdownMenuContent align="end" className="w-48">
          <DropdownMenuItem
            className="text-destructive focus:bg-destructive/10 focus:text-destructive cursor-pointer"
            onSelect={() => setDialogOpen(true)}
          >
            <Trash2 className="w-4 h-4 mr-2" />
            Delete Song
          </DropdownMenuItem>
        </DropdownMenuContent>
      </DropdownMenu>

      <AlertDialog open={dialogOpen} onOpenChange={setDialogOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Delete Song</AlertDialogTitle>
            <AlertDialogDescription>
              Are you sure you want to delete this song? This action cannot be undone.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction onClick={handleDelete} className="bg-destructive text-destructive-foreground hover:bg-destructive/90" disabled={deleting}>
              {deleting ? 'Deleting...' : 'Delete'}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}
