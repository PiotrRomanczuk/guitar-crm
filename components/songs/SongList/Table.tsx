'use client';

import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { useState, useEffect } from 'react';
import { toast } from 'sonner';
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

export default function SongListTable({
  songs,
  canDelete = false,
  onDeleteSuccess,
  selectedStudentId,
}: Props) {
  const router = useRouter();
  const [deletingSongId, setDeletingSongId] = useState<string | null>(null);
  const [songToDelete, setSongToDelete] = useState<Song | null>(null);
  const [deleteError, setDeleteError] = useState<string | null>(null);
  const [assignmentCount, setAssignmentCount] = useState<number>(0);
  const [isCheckingAssignments, setIsCheckingAssignments] = useState(false);

  // Check for assignments when a song is selected for deletion
  useEffect(() => {
    if (!songToDelete) {
      setAssignmentCount(0);
      return;
    }

    const checkAssignments = async () => {
      setIsCheckingAssignments(true);
      
      try {
        const supabase = getSupabaseBrowserClient();
        const { count, error } = await supabase
          .from('lesson_songs')
          .select('*', { count: 'exact', head: true })
          .eq('song_id', songToDelete.id);
        
        if (error) {
          console.error('Error checking assignments:', error);
        } else {
          setAssignmentCount(count || 0);
        }
      } catch (err) {
        console.error('Unexpected error checking assignments:', err);
      } finally {
        setIsCheckingAssignments(false);
      }
    };

    checkAssignments();
  }, [songToDelete]);

  const handleDeleteClick = (song: Song) => {
    setSongToDelete(song);
    setDeleteError(null);
  };

  const handleConfirmDelete = async () => {
    if (!songToDelete) return;

    setDeletingSongId(songToDelete.id);
    setDeleteError(null);

    try {
      const response = await fetch(`/api/song?id=${songToDelete.id}`, {
        method: 'DELETE',
      });

      const result = await response.json();

      if (!response.ok) {
        throw new Error(result.error || 'Failed to delete song');
      }

      if (!result.success) {
        throw new Error(result.error || 'Failed to delete song');
      }

      toast.success('Song deleted successfully');
      setSongToDelete(null);
      onDeleteSuccess?.();
      router.refresh();
    } catch (error) {
      console.error('Delete failed:', error);
      const errorMessage = error instanceof Error ? error.message : 'Failed to delete song';
      setDeleteError(errorMessage);
      toast.error(errorMessage);
    } finally {
      setDeletingSongId(null);
    }
  };

  const handleCancelDelete = () => {
    setSongToDelete(null);
    setDeletingSongId(null);
    setDeleteError(null);
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
          hasLessonAssignments={assignmentCount > 0}
          lessonCount={assignmentCount}
          onConfirm={handleConfirmDelete}
          onClose={handleCancelDelete}
          isDeleting={deletingSongId === songToDelete.id}
          error={deleteError}
          // Pass loading state if the dialog supports it, or just let the warning appear when ready
        />
      )}
    </>
  );
}
