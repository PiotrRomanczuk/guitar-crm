'use client';

import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { useState } from 'react';
import { getSupabaseBrowserClient } from '@/lib/supabase-browser';
import DeleteConfirmationDialog from '../DeleteConfirmationDialog';
import type { Song } from '@/components/songs/types';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import { Button } from '@/components/ui/button';

interface Props {
  songs: Song[];
  canDelete?: boolean;
  onDeleteSuccess?: () => void;
}

export default function SongListTable({ songs, canDelete = false, onDeleteSuccess }: Props) {
  const router = useRouter();
  const [deletingSongId, setDeletingSongId] = useState<string | null>(null);
  const [songToDelete, setSongToDelete] = useState<Song | null>(null);

  const handleDeleteClick = (song: Song) => {
    setSongToDelete(song);
  };

  const handleConfirmDelete = async () => {
    if (!songToDelete) return;

    setDeletingSongId(songToDelete.id);

    try {
      const supabase = getSupabaseBrowserClient();
      const { error } = await supabase.from('songs').delete().eq('id', songToDelete.id);

      if (error) {
        throw new Error(error.message);
      }

      setSongToDelete(null);
      setDeletingSongId(null);
      onDeleteSuccess?.();
      router.refresh();
    } catch (error) {
      console.error('🎸 [FRONTEND] Delete failed:', error);
      setDeletingSongId(null);
    }
  };

  const handleCancelDelete = () => {
    setSongToDelete(null);
    setDeletingSongId(null);
  };

  return (
    <>
      <div className="rounded-md border" data-testid="song-table">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Title</TableHead>
              <TableHead>Author</TableHead>
              <TableHead>Level</TableHead>
              <TableHead>Key</TableHead>
              {canDelete && <TableHead className="text-right">Actions</TableHead>}
            </TableRow>
          </TableHeader>
          <TableBody>
            {songs.length === 0 ? (
              <TableRow>
                <TableCell colSpan={canDelete ? 5 : 4} className="h-24 text-center">
                  No songs found.
                </TableCell>
              </TableRow>
            ) : (
              songs.map((song) => (
                <TableRow key={song.id} data-testid="song-row">
                  <TableCell className="font-medium">
                    <Link
                      href={`/dashboard/songs/${song.id}`}
                      className="text-blue-600 hover:underline"
                    >
                      {song.title ?? 'Untitled'}
                    </Link>
                  </TableCell>
                  <TableCell>{song.author}</TableCell>
                  <TableCell>{song.level}</TableCell>
                  <TableCell>{song.key}</TableCell>
                  {canDelete && (
                    <TableCell className="text-right">
                      <Button
                        variant="destructive"
                        size="sm"
                        data-testid="song-delete-button"
                        onClick={() => handleDeleteClick(song)}
                        disabled={deletingSongId === song.id}
                      >
                        {deletingSongId === song.id ? 'Deleting...' : 'Delete'}
                      </Button>
                    </TableCell>
                  )}
                </TableRow>
              ))
            )}
          </TableBody>
        </Table>
      </div>

      {songToDelete && (
        <DeleteConfirmationDialog
          isOpen={true}
          songTitle={songToDelete.title ?? 'Untitled'}
          hasLessonAssignments={false}
          onConfirm={handleConfirmDelete}
          onClose={handleCancelDelete}
          isDeleting={deletingSongId === songToDelete.id}
        />
      )}
    </>
  );
}
