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
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Checkbox } from '@/components/ui/checkbox';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { Trash2, Music, Plus, MoreHorizontal, Eye, ArrowUpDown, ArrowUp, ArrowDown } from 'lucide-react';
import StatusSelect from './StatusSelect';
import EmptyState from '@/components/shared/EmptyState';
import StatusBadge, { getStatusVariant } from '@/components/shared/StatusBadge';
import Image from 'next/image';

type SortField = 'title' | 'author' | 'level' | 'key' | 'updated_at';
type SortDirection = 'asc' | 'desc';

interface Props {
  songs: (Song | SongWithStatus)[];
  canDelete?: boolean;
  onDeleteSuccess?: () => void;
  selectedStudentId?: string;
  selectedIds?: Set<string>;
  onToggleSelect?: (id: string) => void;
  onToggleSelectAll?: (songIds: string[]) => void;
  isAllSelected?: boolean;
  isIndeterminate?: boolean;
  sortBy?: SortField;
  sortDirection?: SortDirection;
  onSort?: (field: SortField) => void;
}

export default function SongListTable({
  songs,
  canDelete = false,
  onDeleteSuccess,
  selectedStudentId,
  selectedIds,
  onToggleSelect,
  onToggleSelectAll,
  isAllSelected = false,
  isIndeterminate = false,
  sortBy = 'updated_at',
  sortDirection = 'desc',
  onSort,
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

  const SortableHeader = ({ field, children }: { field: SortField; children: React.ReactNode }) => {
    const isActive = sortBy === field;
    const Icon = isActive ? (sortDirection === 'asc' ? ArrowUp : ArrowDown) : ArrowUpDown;

    return (
      <TableHead
        className="text-muted-foreground cursor-pointer select-none hover:text-foreground transition-colors"
        onClick={() => onSort?.(field)}
      >
        <div className="flex items-center gap-2">
          {children}
          <Icon className={`h-4 w-4 ${isActive ? 'text-foreground' : 'text-muted-foreground/40'}`} />
        </div>
      </TableHead>
    );
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
                {canDelete && onToggleSelect && (
                  <div className="pt-1">
                    <Checkbox
                      checked={selectedIds?.has(song.id) ?? false}
                      onCheckedChange={() => onToggleSelect(song.id)}
                      aria-label={`Select ${song.title}`}
                    />
                  </div>
                )}
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
                  <div className="flex items-center gap-2 mb-1">
                    <Link
                      href={`/dashboard/songs/${song.id}`}
                      className="font-medium text-foreground hover:text-primary truncate text-base"
                    >
                      {song.title ?? 'Untitled'}
                    </Link>
                    {(song as Song & { is_draft?: boolean }).is_draft && (
                      <Badge variant="outline" className="text-xs flex-shrink-0">
                        Draft
                      </Badge>
                    )}
                  </div>
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

      {/* Desktop View (Table with Virtual Scrolling) */}
      <div className="hidden md:block relative">
        <div
          className="bg-card rounded-xl border border-border overflow-hidden"
          data-testid="song-table"
        >
          {songs.length === 0 ? (
            <div className="p-8">
              <EmptyState
                variant="table-cell"
                icon={Music}
                title="No songs found"
                description="Add a song to get started"
                action={{ label: 'Add Song', href: '/dashboard/songs/new' }}
              />
            </div>
          ) : (
            <>
              {/* Table Header - Fixed */}
              <div className="overflow-x-auto border-b border-border">
                <Table className="min-w-[600px]">
                  <TableHeader>
                    <TableRow className="hover:bg-transparent border-border">
                      {canDelete && onToggleSelectAll && (
                        <TableHead className="w-12">
                          <Checkbox
                            checked={isAllSelected || (isIndeterminate ? 'indeterminate' : false)}
                            onCheckedChange={() => onToggleSelectAll(songs.map((s) => s.id))}
                            aria-label="Select all songs"
                          />
                        </TableHead>
                      )}
                      <SortableHeader field="title">Song</SortableHeader>
                      <TableHead
                        className="w-48 text-muted-foreground cursor-pointer select-none hover:text-foreground transition-colors"
                        onClick={() => onSort?.('author')}
                      >
                        <div className="flex items-center gap-2">
                          Author
                          {sortBy === 'author' ? (
                            sortDirection === 'asc' ? <ArrowUp className="h-4 w-4" /> : <ArrowDown className="h-4 w-4" />
                          ) : (
                            <ArrowUpDown className="h-4 w-4 text-muted-foreground/40" />
                          )}
                        </div>
                      </TableHead>
                      <TableHead
                        className="w-32 text-muted-foreground cursor-pointer select-none hover:text-foreground transition-colors"
                        onClick={() => onSort?.('level')}
                      >
                        <div className="flex items-center gap-2">
                          {selectedStudentId ? 'Status' : 'Level'}
                          {sortBy === 'level' ? (
                            sortDirection === 'asc' ? <ArrowUp className="h-4 w-4" /> : <ArrowDown className="h-4 w-4" />
                          ) : (
                            <ArrowUpDown className="h-4 w-4 text-muted-foreground/40" />
                          )}
                        </div>
                      </TableHead>
                      <TableHead
                        className="w-20 text-muted-foreground cursor-pointer select-none hover:text-foreground transition-colors"
                        onClick={() => onSort?.('key')}
                      >
                        <div className="flex items-center gap-2">
                          Key
                          {sortBy === 'key' ? (
                            sortDirection === 'asc' ? <ArrowUp className="h-4 w-4" /> : <ArrowDown className="h-4 w-4" />
                          ) : (
                            <ArrowUpDown className="h-4 w-4 text-muted-foreground/40" />
                          )}
                        </div>
                      </TableHead>
                      {canDelete && (
                        <TableHead className="w-24 text-right text-muted-foreground">Actions</TableHead>
                      )}
                    </TableRow>
                  </TableHeader>
                </Table>
              </div>

              {/* Song Rows */}
              <div className="overflow-x-auto">
                <div className="min-w-[600px]">
                  {songs.map((song) => (
                    <div
                      key={song.id}
                      className="group flex items-center border-b border-border hover:bg-secondary/50 transition-colors cursor-pointer relative"
                      onClick={() => router.push(`/dashboard/songs/${song.id}`)}
                    >
                      {canDelete && onToggleSelect && (
                        <div className="w-12 flex items-center justify-center py-3" onClick={(e) => e.stopPropagation()}>
                          <Checkbox
                            checked={selectedIds?.has(song.id) ?? false}
                            onCheckedChange={() => onToggleSelect(song.id)}
                            aria-label={`Select ${song.title}`}
                          />
                        </div>
                      )}
                      <div className="flex-1 px-4 py-3 font-medium min-w-0 relative">
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
                          <div className="flex flex-col min-w-0">
                            <div className="flex items-center gap-2">
                              <span className="text-foreground truncate">{song.title ?? 'Untitled'}</span>
                              {(song as Song & { is_draft?: boolean }).is_draft && (
                                <Badge variant="outline" className="text-xs flex-shrink-0">
                                  Draft
                                </Badge>
                              )}
                            </div>
                          </div>
                        </div>

                        {/* Hover Card with Stats */}
                        {(song as Song & { stats?: { lessonCount: number; studentCount: number; statusBreakdown: { mastered: number; learning: number; to_learn: number } } }).stats && (
                          <div className="absolute left-4 top-full mt-1 z-50 hidden group-hover:block w-72 p-4 bg-card rounded-lg shadow-xl border border-border">
                            <h4 className="text-xs font-semibold text-muted-foreground uppercase tracking-wider mb-3">
                              Song Usage
                            </h4>

                            <div className="space-y-2 text-sm">
                              <div className="flex items-center justify-between">
                                <span className="text-muted-foreground">Lessons:</span>
                                <span className="font-medium text-foreground">
                                  {(song as Song & { stats: { lessonCount: number } }).stats.lessonCount}
                                </span>
                              </div>
                              <div className="flex items-center justify-between">
                                <span className="text-muted-foreground">Students:</span>
                                <span className="font-medium text-foreground">
                                  {(song as Song & { stats: { studentCount: number } }).stats.studentCount}
                                </span>
                              </div>
                            </div>

                            {(song as Song & { stats: { statusBreakdown: { mastered: number; learning: number; to_learn: number } } }).stats.statusBreakdown && (
                              <>
                                <div className="border-t border-border my-3" />
                                <h4 className="text-xs font-semibold text-muted-foreground uppercase tracking-wider mb-2">
                                  Progress
                                </h4>
                                <div className="space-y-1.5 text-xs">
                                  <div className="flex items-center justify-between">
                                    <span className="text-success">✓ Mastered</span>
                                    <span className="font-medium text-foreground">
                                      {(song as Song & { stats: { statusBreakdown: { mastered: number } } }).stats.statusBreakdown.mastered}
                                    </span>
                                  </div>
                                  <div className="flex items-center justify-between">
                                    <span className="text-warning">→ Learning</span>
                                    <span className="font-medium text-foreground">
                                      {(song as Song & { stats: { statusBreakdown: { learning: number } } }).stats.statusBreakdown.learning}
                                    </span>
                                  </div>
                                  <div className="flex items-center justify-between">
                                    <span className="text-muted-foreground">○ To Learn</span>
                                    <span className="font-medium text-foreground">
                                      {(song as Song & { stats: { statusBreakdown: { to_learn: number } } }).stats.statusBreakdown.to_learn}
                                    </span>
                                  </div>
                                </div>
                              </>
                            )}
                          </div>
                        )}
                      </div>
                      <div className="w-48 px-4 py-3">
                        <span className="text-muted-foreground truncate">{song.author || 'Unknown'}</span>
                      </div>
                      <div className="w-32 px-4 py-3" onClick={(e) => e.stopPropagation()}>
                        {selectedStudentId && (song as SongWithStatus).lesson_song_id ? (
                          <StatusSelect
                            lessonSongId={(song as SongWithStatus).lesson_song_id!}
                            currentStatus={(song as SongWithStatus).status || 'to_learn'}
                          />
                        ) : selectedStudentId ? (
                          <Badge variant="outline" className="bg-muted text-muted-foreground border-border">
                            Not Assigned
                          </Badge>
                        ) : (
                          <StatusBadge variant={getStatusVariant(song.level)}>
                            {song.level || 'Unknown'}
                          </StatusBadge>
                        )}
                      </div>
                      <div className="w-20 px-4 py-3 text-muted-foreground">{song.key}</div>
                      {canDelete && (
                        <div className="w-24 px-4 py-3 text-right" onClick={(e) => e.stopPropagation()}>
                          <DropdownMenu>
                            <DropdownMenuTrigger asChild>
                              <Button variant="ghost" size="icon" className="h-8 w-8">
                                <MoreHorizontal className="h-4 w-4" />
                              </Button>
                            </DropdownMenuTrigger>
                            <DropdownMenuContent align="end">
                              <DropdownMenuItem asChild>
                                <Link href={`/dashboard/songs/${song.id}`}>
                                  <Eye className="h-4 w-4 mr-2" />
                                  View Details
                                </Link>
                              </DropdownMenuItem>
                              <DropdownMenuItem onClick={() => setAssignDialogSong(song)}>
                                <Plus className="h-4 w-4 mr-2" />
                                Assign to Lesson
                              </DropdownMenuItem>
                              <DropdownMenuSeparator />
                              <DropdownMenuItem
                                onClick={() => handleDeleteClick(song)}
                                disabled={deletingSongId === song.id || checkingId === song.id}
                                className="text-destructive focus:text-destructive"
                              >
                                {deletingSongId === song.id || checkingId === song.id ? (
                                  <>
                                    <span className="h-4 w-4 mr-2 animate-spin rounded-full border-2 border-current border-t-transparent" />
                                    Deleting...
                                  </>
                                ) : (
                                  <>
                                    <Trash2 className="h-4 w-4 mr-2" />
                                    Delete
                                  </>
                                )}
                              </DropdownMenuItem>
                            </DropdownMenuContent>
                          </DropdownMenu>
                        </div>
                      )}
                    </div>
                  ))}
                </div>
              </div>
            </>
          )}
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
