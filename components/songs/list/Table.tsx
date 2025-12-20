'use client';

import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { useState } from 'react';
import { getSupabaseBrowserClient } from '@/lib/supabase-browser';
import DeleteConfirmationDialog from '../actions/DeleteConfirmationDialog';
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

import { cn } from '@/lib/utils';

interface Props {
  songs: (Song | SongWithStatus)[];
  canDelete?: boolean;
  onDeleteSuccess?: () => void;
  selectedStudentId?: string;
}

const levelColors = {
  Beginner: 'bg-blue-500/10 text-blue-400 border-blue-500/20',
  Intermediate: 'bg-primary/10 text-primary border-primary/20',
  Advanced: 'bg-destructive/10 text-destructive border-destructive/20',
  Unknown: 'bg-muted text-muted-foreground border-border',
};

function getLevelBadgeClass(level: string | null | undefined): string {
  if (!level) return levelColors.Unknown;
  const normalizedLevel = level.charAt(0).toUpperCase() + level.slice(1).toLowerCase();
  // @ts-expect-error - indexing with string
  return levelColors[normalizedLevel] || levelColors.Unknown;
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
  const [checkingId, setCheckingId] = useState<string | null>(null);

  const handleDeleteClick = async (song: Song) => {
    console.log('🎸 [FRONTEND] handleDeleteClick called for song:', song.id);
    setCheckingId(song.id);

    try {
      const supabase = getSupabaseBrowserClient();
      console.log('🎸 [FRONTEND] Checking assignments for song:', song.id);
      const { count, error } = await supabase
        .from('lesson_songs')
        .select('*', { count: 'exact', head: true })
        .eq('song_id', song.id);

      if (error) {
        console.error('🎸 [FRONTEND] Error checking assignments:', error);
      } else {
        console.log('🎸 [FRONTEND] Assignment count:', count);
      }

      setAssignmentCount(count || 0);
      setSongToDelete(song);
    } catch (err) {
      console.error('🎸 [FRONTEND] Unexpected error in handleDeleteClick:', err);
    } finally {
      setCheckingId(null);
      setDeleteError(null);
    }
  };

  const handleConfirmDelete = async () => {
    if (!songToDelete) return;

    setDeletingSongId(songToDelete.id);
    setDeleteError(null);

    try {
      const supabase = getSupabaseBrowserClient();

      // Get current user for the RPC
      const {
        data: { user },
      } = await supabase.auth.getUser();
      if (!user) throw new Error('User not authenticated');

      // Use RPC for soft delete
      const { data, error } = await supabase.rpc('soft_delete_song_with_cascade', {
        song_uuid: songToDelete.id,
        user_uuid: user.id,
      });

      if (error) {
        throw new Error(error.message);
      }

      // Check result from RPC
      // The RPC returns JSON, so we cast it to any or a specific type
      const result = data as { success: boolean; error?: string };
      if (!result.success) {
        throw new Error(result.error || 'Failed to delete song');
      }

      setSongToDelete(null);
      setDeletingSongId(null);
      onDeleteSuccess?.();
      router.refresh();
    } catch (error) {
      console.error('🎸 [FRONTEND] Delete failed:', error);
      setDeleteError(error instanceof Error ? error.message : 'Failed to delete song');
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
      <div
        className="bg-card rounded-xl border border-border overflow-hidden"
        data-testid="song-table"
      >
        <div className="overflow-x-auto">
          <Table className="min-w-[600px]">
            <TableHeader>
              <TableRow className="hover:bg-transparent border-border">
                <TableHead className="text-muted-foreground">Title</TableHead>
                <TableHead className="text-muted-foreground">Author</TableHead>
                <TableHead className="text-muted-foreground">
                  {selectedStudentId ? 'Status' : 'Level'}
                </TableHead>
                <TableHead className="text-muted-foreground">Key</TableHead>
                {canDelete && (
                  <TableHead className="text-right text-muted-foreground">Actions</TableHead>
                )}
              </TableRow>
            </TableHeader>
            <TableBody>
              {songs.length === 0 ? (
                <TableRow>
                  <TableCell
                    colSpan={canDelete ? 5 : 4}
                    className="h-24 text-center text-muted-foreground"
                  >
                    No songs found.
                  </TableCell>
                </TableRow>
              ) : (
                songs.map((song) => (
                  <TableRow
                    key={song.id}
                    data-testid="song-row"
                    className="hover:bg-secondary/50 border-border transition-colors"
                  >
                    <TableCell className="font-medium">
                      <Link
                        href={`/dashboard/songs/${song.id}`}
                        className="text-foreground hover:text-primary transition-colors"
                      >
                        {song.title ?? 'Untitled'}
                      </Link>
                    </TableCell>
                    <TableCell className="text-muted-foreground">{song.author}</TableCell>
                    <TableCell>
                      {selectedStudentId && (song as SongWithStatus).lesson_song_id ? (
                        <StatusSelect
                          lessonSongId={(song as SongWithStatus).lesson_song_id!}
                          currentStatus={(song as SongWithStatus).status || 'to_learn'}
                        />
                      ) : selectedStudentId ? (
                        <Badge
                          variant="outline"
                          className="bg-muted text-muted-foreground border-border"
                        >
                          Not Assigned
                        </Badge>
                      ) : (
                        <Badge variant="outline" className={cn(getLevelBadgeClass(song.level))}>
                          {song.level || 'Unknown'}
                        </Badge>
                      )}
                    </TableCell>
                    <TableCell className="text-muted-foreground">{song.key}</TableCell>
                    {canDelete && (
                      <TableCell className="text-right">
                        <Button
                          variant="ghost"
                          size="icon"
                          className="h-8 w-8 text-muted-foreground hover:text-destructive hover:bg-destructive/10"
                          data-testid="song-delete-button"
                          onClick={() => handleDeleteClick(song)}
                          disabled={deletingSongId === song.id || checkingId === song.id}
                        >
                          {deletingSongId === song.id || checkingId === song.id ? (
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
        />
      )}
    </>
  );
}
