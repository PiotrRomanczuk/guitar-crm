'use client';

import { useCallback, useEffect, useState } from 'react';
import { useSearchParams, usePathname, useRouter } from 'next/navigation';
import { toast } from 'sonner';
import type { Song } from '../types';
import SongListFilter from './Filter';
import SongListTable from './Table';
import SongListHeader from './Header';
import SongListEmpty from './Empty';
import BulkActionBar from './BulkActionBar';
import BulkDeleteDialog from './BulkDeleteDialog';
import AnalyticsQuickAccess from './AnalyticsQuickAccess';
import { useSongSelection } from './useSongSelection';
import { bulkSoftDeleteSongs } from '@/app/actions/songs';

interface Props {
  initialSongs: Song[];
  isAdmin: boolean;
  students?: { id: string; full_name: string | null; student_status: string | null }[];
  selectedStudentId?: string;
  categories?: string[];
  authors?: string[];
}

type SortField = 'title' | 'author' | 'level' | 'key' | 'updated_at';
type SortDirection = 'asc' | 'desc';

export function SongListClient({
  initialSongs,
  isAdmin,
  students,
  selectedStudentId,
  categories,
  authors,
}: Props) {
  const searchParams = useSearchParams();
  const pathname = usePathname();
  const { replace } = useRouter();

  const VALID_SORT_FIELDS: SortField[] = ['title', 'author', 'level', 'key', 'updated_at'];
  const sortByParam = searchParams.get('sortBy') as SortField | null;
  const sortBy: SortField = sortByParam && VALID_SORT_FIELDS.includes(sortByParam) ? sortByParam : 'updated_at';
  const sortDirParam = searchParams.get('sortDir');
  const sortDirection: SortDirection = sortDirParam === 'asc' || sortDirParam === 'desc' ? sortDirParam : 'desc';

  const [songs, setSongs] = useState<Song[]>(initialSongs);

  // Sync local state when server data changes (e.g., navigation)
  useEffect(() => {
    setSongs(initialSongs);
  }, [initialSongs]);

  const selection = useSongSelection();
  const [bulkDeleteOpen, setBulkDeleteOpen] = useState(false);
  const [bulkDeleting, setBulkDeleting] = useState(false);
  const [bulkDeleteError, setBulkDeleteError] = useState<string | null>(null);

  // Sort songs
  const sortedSongs = [...songs].sort((a, b) => {
    let aValue: string | number | null | undefined;
    let bValue: string | number | null | undefined;

    switch (sortBy) {
      case 'title':
        aValue = a.title?.toLowerCase() || '';
        bValue = b.title?.toLowerCase() || '';
        break;
      case 'author':
        aValue = a.author?.toLowerCase() || '';
        bValue = b.author?.toLowerCase() || '';
        break;
      case 'level':
        // Sort order: beginner < intermediate < advanced
        const levelOrder = { beginner: 1, intermediate: 2, advanced: 3 };
        aValue = levelOrder[a.level as keyof typeof levelOrder] || 999;
        bValue = levelOrder[b.level as keyof typeof levelOrder] || 999;
        break;
      case 'key':
        aValue = a.key?.toLowerCase() || '';
        bValue = b.key?.toLowerCase() || '';
        break;
      case 'updated_at':
        aValue = a.updated_at || '';
        bValue = b.updated_at || '';
        break;
    }

    if (aValue < bValue) return sortDirection === 'asc' ? -1 : 1;
    if (aValue > bValue) return sortDirection === 'asc' ? 1 : -1;
    return 0;
  });

  const handleSort = useCallback(
    (field: SortField) => {
      const params = new URLSearchParams(searchParams);
      if (sortBy === field) {
        params.set('sortDir', sortDirection === 'asc' ? 'desc' : 'asc');
      } else {
        params.set('sortBy', field);
        params.set('sortDir', field === 'updated_at' ? 'desc' : 'asc');
      }
      replace(`${pathname}?${params.toString()}`);
    },
    [searchParams, pathname, replace, sortBy, sortDirection]
  );

  const songIds = sortedSongs.map((s) => s.id);

  const handleDeleteSuccess = (deletedSongId: string) => {
    setSongs((prev) => prev.filter((s) => s.id !== deletedSongId));
  };

  const handleBulkDelete = async () => {
    setBulkDeleting(true);
    setBulkDeleteError(null);

    try {
      const result = await bulkSoftDeleteSongs(Array.from(selection.selectedIds));

      if (result.deletedCount > 0) {
        toast.success(`Deleted ${result.deletedCount} ${result.deletedCount === 1 ? 'song' : 'songs'}`);
      }

      if (result.errors.length > 0) {
        toast.error(`Failed to delete ${result.errors.length} ${result.errors.length === 1 ? 'song' : 'songs'}`);
      }

      // Remove deleted songs from local state
      // On partial failure, remove all selected since we can't determine which failed
      // Server data will reconcile on next navigation
      if (result.deletedCount > 0) {
        const idsToRemove = new Set(selection.selectedIds);
        setSongs((prev) => prev.filter((s) => !idsToRemove.has(s.id)));
      }

      setBulkDeleteOpen(false);
      selection.clearSelection();
    } catch {
      setBulkDeleteError('An unexpected error occurred');
    } finally {
      setBulkDeleting(false);
    }
  };

  return (
    <div className="space-y-6">
      <SongListHeader canManageSongs={isAdmin} />

      <AnalyticsQuickAccess visible={isAdmin} />

      <SongListFilter students={students} categories={categories} authors={authors} />

      {isAdmin && (
        <BulkActionBar
          selectedCount={selection.selectedCount}
          onDelete={() => {
            setBulkDeleteError(null);
            setBulkDeleteOpen(true);
          }}
          onClear={selection.clearSelection}
          isDeleting={bulkDeleting}
        />
      )}

      {songs.length === 0 ? (
        <SongListEmpty />
      ) : (
        <>
          <SongListTable
            songs={sortedSongs}
            canDelete={isAdmin}
            onDeleteSuccess={handleDeleteSuccess}
            selectedStudentId={selectedStudentId}
            selectedIds={selection.selectedIds}
            onToggleSelect={selection.toggleSelect}
            onToggleSelectAll={selection.toggleSelectAll}
            isAllSelected={selection.isAllSelected(songIds)}
            isIndeterminate={selection.isIndeterminate(songIds)}
            sortBy={sortBy}
            sortDirection={sortDirection}
            onSort={handleSort}
          />
        </>
      )}
      <BulkDeleteDialog
        isOpen={bulkDeleteOpen}
        count={selection.selectedCount}
        onConfirm={handleBulkDelete}
        onClose={() => setBulkDeleteOpen(false)}
        isDeleting={bulkDeleting}
        error={bulkDeleteError}
      />
    </div>
  );
}
