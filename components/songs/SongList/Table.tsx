'use client';

import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { useState } from 'react';
import { getSupabaseBrowserClient } from '@/lib/supabase-browser';
import DeleteConfirmationDialog from '../DeleteConfirmationDialog';
import type { Song, SongWithStatus } from '@/components/songs/types';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Trash2 } from 'lucide-react';
import StatusSelect from './StatusSelect';

interface Props {
  songs: (Song | SongWithStatus)[];
  canDelete?: boolean;
  onDeleteSuccess?: () => void;
  selectedStudentId?: string;
}

function getLevelBadgeVariant(
  level: string | null | undefined
): 'default' | 'secondary' | 'destructive' | 'outline' {
  if (!level) return 'outline';

  const normalizedLevel = level.toLowerCase();
  if (normalizedLevel.includes('beginner')) return 'secondary';
  if (normalizedLevel.includes('intermediate')) return 'default';
  if (normalizedLevel.includes('advanced')) return 'destructive';

  return 'outline';
}

function getStatusBadgeVariant(
  status: string | null | undefined
): 'default' | 'secondary' | 'destructive' | 'outline' {
  if (!status) return 'outline';

  switch (status) {
    case 'mastered':
      return 'default'; // Green-ish usually
    case 'started':
    case 'in_progress':
      return 'secondary';
    case 'to_learn':
      return 'outline';
    default:
      return 'outline';
  }
}

export default function SongListTable({
  songs,
  canDelete = false,
  onDeleteSuccess,
  selectedStudentId,
}: Props) {
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
              <TableHead>{selectedStudentId ? 'Status' : 'Level'}</TableHead>
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
                  <TableCell>
                    {selectedStudentId && (song as SongWithStatus).lesson_song_id ? (
                      <StatusSelect
                        lessonSongId={(song as SongWithStatus).lesson_song_id!}
                        currentStatus={(song as SongWithStatus).status || 'to_learn'}
                      />
                    ) : selectedStudentId ? (
                      <Badge variant="outline">Not Assigned</Badge>
                    ) : (
                      <Badge variant={getLevelBadgeVariant(song.level)}>
                        {song.level || 'Unknown'}
                      </Badge>
                    )}
                  </TableCell>
                  <TableCell>{song.key}</TableCell>
                  {canDelete && (
                    <TableCell className="text-right">
                      <Button
                        variant="ghost"
                        size="icon"
                        className="h-8 w-8 text-red-500 hover:text-red-700 hover:bg-red-50"
                        data-testid="song-delete-button"
                        onClick={() => handleDeleteClick(song)}
                        disabled={deletingSongId === song.id}
                      >
                        {deletingSongId === song.id ? (
                          <span className="h-4 w-4 animate-spin rounded-full border-2 border-current border-t-transparent" />
                        ) : (
                          <Trash2 className="h-4 w-4" />
                        )}
                        <span className="sr-only">Delete {song.title}</span>
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
