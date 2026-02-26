'use client';

import Link from 'next/link';
import type { Song, SongWithStatus } from '@/components/songs/types';
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
import { Trash2, Music, Plus, MoreHorizontal, Eye } from 'lucide-react';
import StatusSelect from './StatusSelect';
import StatusBadge, { getStatusVariant } from '@/components/shared/StatusBadge';
import Image from 'next/image';
import HoverStatsCard from './Table.HoverStatsCard';

interface SongStatusCellProps {
  song: Song | SongWithStatus;
  selectedStudentId?: string;
}

export function SongStatusCell({ song, selectedStudentId }: SongStatusCellProps) {
  if (selectedStudentId && (song as SongWithStatus).lesson_song_id) {
    return (
      <StatusSelect
        lessonSongId={(song as SongWithStatus).lesson_song_id!}
        currentStatus={(song as SongWithStatus).status || 'to_learn'}
      />
    );
  }
  if (selectedStudentId) {
    return (
      <Badge variant="outline" className="bg-muted text-muted-foreground border-border">
        Not Assigned
      </Badge>
    );
  }
  return (
    <StatusBadge variant={getStatusVariant(song.level)}>
      {song.level || 'Unknown'}
    </StatusBadge>
  );
}

export interface SongRowSharedProps {
  song: Song | SongWithStatus;
  canDelete: boolean;
  selectedStudentId?: string;
  selectedIds?: Set<string>;
  onToggleSelect?: (id: string) => void;
  deletingSongId: string | null;
  checkingId: string | null;
  onDeleteClick: (song: Song) => void;
  onAssignClick: (song: Song) => void;
}

export function SongMobileCard({
  song,
  canDelete,
  selectedStudentId,
  selectedIds,
  onToggleSelect,
  deletingSongId,
  checkingId,
  onDeleteClick,
  onAssignClick,
}: SongRowSharedProps) {
  const isBusy = deletingSongId === song.id || checkingId === song.id;
  return (
    <div className="relative bg-card rounded-xl border border-border p-4 space-y-3 hover:bg-secondary/50 transition-colors">
      <Link
        href={`/dashboard/songs/${song.id}`}
        className="absolute inset-0 z-[1] rounded-xl"
        aria-label={`View ${song.title ?? 'song'}`}
      />
      <div className="flex items-start gap-3">
        {canDelete && onToggleSelect && (
          <div className="relative z-10 pt-1" onClick={(e) => e.stopPropagation()}>
            <Checkbox
              checked={selectedIds?.has(song.id) ?? false}
              onCheckedChange={() => onToggleSelect(song.id)}
              aria-label={`Select ${song.title}`}
            />
          </div>
        )}
        <div className="relative w-16 h-16 rounded-md overflow-hidden flex-shrink-0 bg-muted flex items-center justify-center border border-border">
          {song.cover_image_url ? (
            <Image src={song.cover_image_url} alt={song.title || 'Song cover'} fill sizes="64px" className="object-cover" />
          ) : (
            <Music className="w-8 h-8 text-muted-foreground" />
          )}
        </div>
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-2 mb-1">
            <span className="font-medium text-foreground truncate text-base">
              {song.title ?? 'Untitled'}
            </span>
            {(song as Song & { is_draft?: boolean }).is_draft && (
              <Badge variant="outline" className="text-xs flex-shrink-0">Draft</Badge>
            )}
          </div>
          <p className="text-sm text-muted-foreground truncate">{song.author || 'Unknown Artist'}</p>
          {song.key && <p className="text-xs text-muted-foreground mt-1">Key: {song.key}</p>}
        </div>
        {canDelete && (
          <div className="relative z-10" onClick={(e) => e.stopPropagation()}>
            <Button
              variant="ghost" size="icon"
              className="h-11 w-11 sm:h-8 sm:w-8 text-muted-foreground hover:text-destructive hover:bg-destructive/10 -mr-2 -mt-2"
              onClick={() => onDeleteClick(song)} disabled={isBusy}
            >
              {isBusy ? <span className="h-4 w-4 animate-spin rounded-full border-2 border-current border-t-transparent" /> : <Trash2 className="h-4 w-4" />}
              <span className="sr-only">Delete {song.title}</span>
            </Button>
          </div>
        )}
      </div>
      <div className="relative z-10 pt-2 border-t border-border space-y-3">
        <div className="flex items-center justify-between">
          <span className="text-xs text-muted-foreground">{selectedStudentId ? 'Status' : 'Level'}</span>
          <div onClick={(e) => e.stopPropagation()}>
            <SongStatusCell song={song} selectedStudentId={selectedStudentId} />
          </div>
        </div>
        <div className="flex gap-2">
          <Button variant="outline" size="sm" className="flex-1" onClick={(e) => { e.stopPropagation(); onAssignClick(song); }}>
            <Plus className="h-4 w-4 mr-1" />
            Assign to Lesson
          </Button>
          {canDelete && (
            <Button variant="ghost" size="sm" onClick={(e) => { e.stopPropagation(); onDeleteClick(song); }} disabled={isBusy}
              className="text-muted-foreground hover:text-destructive hover:bg-destructive/10"
            >
              {isBusy ? <span className="h-4 w-4 animate-spin rounded-full border-2 border-current border-t-transparent" /> : <Trash2 className="h-4 w-4" />}
            </Button>
          )}
        </div>
      </div>
    </div>
  );
}

export interface SongDesktopRowProps extends SongRowSharedProps {
  onRowClick?: (id: string) => void;
}

export function SongDesktopRow({
  song, canDelete, selectedStudentId, selectedIds, onToggleSelect,
  deletingSongId, checkingId, onDeleteClick, onAssignClick,
}: SongDesktopRowProps) {
  const isBusy = deletingSongId === song.id || checkingId === song.id;
  type SongWithStats = Song & { stats?: { lessonCount: number; studentCount: number; statusBreakdown?: { mastered: number; learning: number; to_learn: number } } };
  return (
    <div
      className="group flex items-center border-b border-border hover:bg-secondary/50 transition-colors relative"
    >
      <Link
        href={`/dashboard/songs/${song.id}`}
        className="absolute inset-0 z-[1]"
        aria-label={`View ${song.title ?? 'song'}`}
      />
      {canDelete && onToggleSelect && (
        <div className="relative z-10 w-12 flex items-center justify-center py-3" onClick={(e) => e.stopPropagation()}>
          <Checkbox checked={selectedIds?.has(song.id) ?? false} onCheckedChange={() => onToggleSelect(song.id)} aria-label={`Select ${song.title}`} />
        </div>
      )}
      <div className="flex-1 px-4 py-3 font-medium min-w-0 relative">
        <div className="flex items-center gap-3">
          <div className="relative w-12 h-12 rounded-md overflow-hidden flex-shrink-0 bg-muted flex items-center justify-center border border-border">
            {song.cover_image_url ? (
              <Image src={song.cover_image_url} alt={song.title || 'Song cover'} fill sizes="48px" className="object-cover" />
            ) : (
              <Music className="w-6 h-6 text-muted-foreground" />
            )}
          </div>
          <div className="flex flex-col min-w-0">
            <div className="flex items-center gap-2">
              <span className="text-foreground truncate">{song.title ?? 'Untitled'}</span>
              {(song as Song & { is_draft?: boolean }).is_draft && (
                <Badge variant="outline" className="text-xs flex-shrink-0">Draft</Badge>
              )}
            </div>
          </div>
        </div>
        <HoverStatsCard song={song as SongWithStats} />
      </div>
      <div className="w-48 px-4 py-3">
        <span className="text-muted-foreground truncate">{song.author || 'Unknown'}</span>
      </div>
      <div className="relative z-10 w-32 px-4 py-3" onClick={(e) => e.stopPropagation()}>
        <SongStatusCell song={song} selectedStudentId={selectedStudentId} />
      </div>
      <div className="w-20 px-4 py-3 text-muted-foreground">{song.key}</div>
      {!canDelete && (
        <div className="w-24 px-4 py-3 text-right">
          <Eye className="h-4 w-4 text-muted-foreground opacity-0 group-hover:opacity-100 transition-opacity inline-block" />
        </div>
      )}
      {canDelete && (
        <div className="relative z-10 w-24 px-4 py-3 text-right" onClick={(e) => e.stopPropagation()}>
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="ghost" size="icon" className="h-8 w-8">
                <MoreHorizontal className="h-4 w-4" />
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end">
              <DropdownMenuItem asChild>
                <Link href={`/dashboard/songs/${song.id}`}>
                  <Eye className="h-4 w-4 mr-2" />View Details
                </Link>
              </DropdownMenuItem>
              <DropdownMenuItem onClick={() => onAssignClick(song)}>
                <Plus className="h-4 w-4 mr-2" />Assign to Lesson
              </DropdownMenuItem>
              <DropdownMenuSeparator />
              <DropdownMenuItem onClick={() => onDeleteClick(song)} disabled={isBusy} className="text-destructive focus:text-destructive">
                {isBusy ? (
                  <><span className="h-4 w-4 mr-2 animate-spin rounded-full border-2 border-current border-t-transparent" />Deleting...</>
                ) : (
                  <><Trash2 className="h-4 w-4 mr-2" />Delete</>
                )}
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        </div>
      )}
    </div>
  );
}
