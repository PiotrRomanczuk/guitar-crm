'use client';

import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { useState } from 'react';
import { getSupabaseBrowserClient } from '@/lib/supabase-browser';
import DeleteConfirmationDialog from '../actions/DeleteConfirmationDialog';
import QuickAssignDialog from './QuickAssignDialog';
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
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { Trash2, Music, Plus, MoreHorizontal, Eye } from 'lucide-react';
import StatusSelect from './StatusSelect';
import EmptyState from '@/components/shared/EmptyState';
import StatusBadge, { getStatusVariant } from '@/components/shared/StatusBadge';
import Image from 'next/image';

interface Props {
  songs: (Song | SongWithStatus)[];
  canDelete?: boolean;
  onDeleteSuccess?: () => void;
  selectedStudentId?: string;
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
  const [assignDialogSong, setAssignDialogSong] = useState<Song | null>(null);

  const handleDeleteClick = async (song: Song) => {
    setCheckingId(song.id);

    try {
      const supabase = getSupabaseBrowserClient();
      const { count, error } = await supabase
        .from('lesson_songs')
        .select('*', { count: 'exact', head: true })
        .eq('song_id', song.id);

      if (error) {
        console.error('Error checking assignments:', error);
      }

      setAssignmentCount(count || 0);
      setSongToDelete(song);
    } catch (err) {
      console.error('Unexpected error in handleDeleteClick:', err);
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
      console.error('Delete failed:', error);
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
      {/* Mobile View (Cards) */}
      <div className="md:hidden space-y-4">
        {songs.length === 0 ? (
          <div className="bg-card rounded-xl border border-border">
            <EmptyState
              variant="table-cell"
              icon={Music}
              title="No songs found"
              description="Add a song to get started"
              action={{ label: "Add Song", href: "/dashboard/songs/new" }}
            />
          </div>
        ) : (
          songs.map((song) => (
            <div key={song.id} className="bg-card rounded-xl border border-border p-4 space-y-3">
              <div className="flex items-start gap-3">
                <div className="relative w-16 h-16 rounded-md overflow-hidden flex-shrink-0 bg-muted flex items-center justify-center border border-border">
                  {song.cover_image_url ? (
                    <Image
                      src={song.cover_image_url}
                      alt={song.title || 'Song cover'}
                      fill
                      sizes="64px"
                      className="object-cover"
                    />
                  ) : (
                    <Music className="w-8 h-8 text-muted-foreground" />
                  )}
                </div>

                <div className="flex-1 min-w-0">
                  <Link
                    href={`/dashboard/songs/${song.id}`}
                    className="font-medium text-foreground hover:text-primary block truncate text-base"
                  >
                    {song.title ?? 'Untitled'}
                  </Link>
                  <p className="text-sm text-muted-foreground truncate">
                    {song.author || 'Unknown Artist'}
                  </p>
                  {song.key && (
                    <p className="text-xs text-muted-foreground mt-1">Key: {song.key}</p>
                  )}
                </div>

                {canDelete && (
                  <Button
                    variant="ghost"
                    size="icon"
                    className="h-11 w-11 sm:h-8 sm:w-8 text-muted-foreground hover:text-destructive hover:bg-destructive/10 -mr-2 -mt-2"
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
                )}
              </div>

              <div className="pt-2 border-t border-border space-y-3">
                <div className="flex items-center justify-between">
                  <span className="text-xs text-muted-foreground">
                    {selectedStudentId ? 'Status' : 'Level'}
                  </span>
                  <div>
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
                      <StatusBadge variant={getStatusVariant(song.level)}>
                        {song.level || 'Unknown'}
                      </StatusBadge>
                    )}
                  </div>
                </div>

                {/* Quick Actions */}
                <div className="flex gap-2">
                  <Button
                    variant="outline"
                    size="sm"
                    className="flex-1"
                    onClick={(e) => {
                      e.stopPropagation();
                      setAssignDialogSong(song);
                    }}
                  >
                    <Plus className="h-4 w-4 mr-1" />
                    Assign to Lesson
                  </Button>
                  {canDelete && (
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={(e) => {
                        e.stopPropagation();
                        handleDeleteClick(song);
                      }}
                      disabled={deletingSongId === song.id || checkingId === song.id}
                      className="text-muted-foreground hover:text-destructive hover:bg-destructive/10"
                    >
                      {deletingSongId === song.id || checkingId === song.id ? (
                        <span className="h-4 w-4 animate-spin rounded-full border-2 border-current border-t-transparent" />
                      ) : (
                        <Trash2 className="h-4 w-4" />
                      )}
                    </Button>
                  )}
                </div>
              </div>
            </div>
          ))
        )}
      </div>

      {/* Desktop View (Table) */}
      <div
        className="hidden md:block bg-card rounded-xl border border-border overflow-hidden"
        data-testid="song-table"
      >
        <div className="overflow-x-auto">
          <Table className="min-w-[600px]">
            <TableHeader>
              <TableRow className="hover:bg-transparent border-border">
                <TableHead className="text-muted-foreground">Song</TableHead>
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
                  <TableCell colSpan={canDelete ? 4 : 3}>
                    <EmptyState
                      variant="table-cell"
                      icon={Music}
                      title="No songs found"
                      description="Add a song to get started"
                      action={{ label: "Add Song", href: "/dashboard/songs/new" }}
                    />
                  </TableCell>
                </TableRow>
              ) : (
                songs.map((song) => (
                  <TableRow
                    key={song.id}
                    data-testid="song-row"
                    className="hover:bg-secondary/50 border-border transition-colors cursor-pointer"
                    onClick={() => router.push(`/dashboard/songs/${song.id}`)}
                  >
                    <TableCell className="font-medium">
                      <div className="flex items-center gap-3">
                        <div className="relative w-12 h-12 rounded-md overflow-hidden flex-shrink-0 bg-muted flex items-center justify-center border border-border">
                          {song.cover_image_url ? (
                            <Image
                              src={song.cover_image_url}
                              alt={song.title || 'Song cover'}
                              fill
                              sizes="48px"
                              className="object-cover"
                            />
                          ) : (
                            <Music className="w-6 h-6 text-muted-foreground" />
                          )}
                        </div>
                        <div className="flex flex-col">
                          <span className="text-foreground">{song.title ?? 'Untitled'}</span>
                          <span className="text-xs text-muted-foreground">{song.author}</span>
                        </div>
                      </div>
                    </TableCell>
                    <TableCell onClick={(e) => e.stopPropagation()}>
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
                        <StatusBadge variant={getStatusVariant(song.level)}>
                          {song.level || 'Unknown'}
                        </StatusBadge>
                      )}
                    </TableCell>
                    <TableCell className="text-muted-foreground">{song.key}</TableCell>
                    {canDelete && (
                      <TableCell className="text-right" onClick={(e) => e.stopPropagation()}>
                        <DropdownMenu>
                          <DropdownMenuTrigger asChild>
                            <Button
                              variant="ghost"
                              size="icon"
                              className="h-8 w-8 text-muted-foreground"
                            >
                              <MoreHorizontal className="h-4 w-4" />
                              <span className="sr-only">Open menu for {song.title}</span>
                            </Button>
                          </DropdownMenuTrigger>
                          <DropdownMenuContent align="end">
                            <DropdownMenuItem
                              onClick={(e) => {
                                e.stopPropagation();
                                setAssignDialogSong(song);
                              }}
                            >
                              <Plus className="mr-2 h-4 w-4" />
                              Quick Assign to Lesson
                            </DropdownMenuItem>
                            <DropdownMenuItem
                              onClick={(e) => {
                                e.stopPropagation();
                                router.push(`/dashboard/songs/${song.id}`);
                              }}
                            >
                              <Eye className="mr-2 h-4 w-4" />
                              View Details
                            </DropdownMenuItem>
                            <DropdownMenuSeparator />
                            <DropdownMenuItem
                              onClick={(e) => {
                                e.stopPropagation();
                                handleDeleteClick(song);
                              }}
                              disabled={deletingSongId === song.id || checkingId === song.id}
                              className="text-destructive focus:text-destructive"
                            >
                              {deletingSongId === song.id || checkingId === song.id ? (
                                <span className="mr-2 h-4 w-4 animate-spin rounded-full border-2 border-current border-t-transparent" />
                              ) : (
                                <Trash2 className="mr-2 h-4 w-4" />
                              )}
                              Delete Song
                            </DropdownMenuItem>
                          </DropdownMenuContent>
                        </DropdownMenu>
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

      {assignDialogSong && (
        <QuickAssignDialog
          isOpen={!!assignDialogSong}
          song={assignDialogSong}
          onClose={() => setAssignDialogSong(null)}
          onSuccess={() => {
            setAssignDialogSong(null);
            router.refresh();
          }}
        />
      )}
    </>
  );
}
