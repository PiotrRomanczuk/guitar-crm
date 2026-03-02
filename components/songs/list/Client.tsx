'use client';

import { useCallback, useEffect } from 'react';
import { useSearchParams, usePathname, useRouter } from 'next/navigation';
import { useState } from 'react';
import { toast } from 'sonner';
import type { Song } from '../types';
import SongListFilter from './Filter';
import SongListTable from './Table';
import SongListHeader from './Header';
import SongListEmpty from './Empty';
import BulkActionBar from './BulkActionBar';
import BulkDeleteDialog from './BulkDeleteDialog';
import PaginationControls from './PaginationControls';
import { useSongSelection } from './useSongSelection';
import { bulkSoftDeleteSongs } from '@/app/actions/songs';

interface Props {
  initialSongs: Song[];
  isAdmin: boolean;
  students?: { id: string; full_name: string | null; student_status: string | null }[];
  selectedStudentId?: string;
  categories?: string[];
  authors?: string[];
  totalCount: number;
  currentPage: number;
  pageSize: number;
}

type SortField = 'title' | 'author' | 'level' | 'key' | 'updated_at';

export function SongListClient({
  initialSongs,
  isAdmin,
  students,
  selectedStudentId,
  categories,
  authors,
  totalCount,
  currentPage,
  pageSize,
}: Props) {
  const searchParams = useSearchParams();
  const pathname = usePathname();
  const router = useRouter();

  // Read sort state from URL (server already sorted the data)
  const VALID_SORT_FIELDS: SortField[] = ['title', 'author', 'level', 'key', 'updated_at'];
  const sortByParam = searchParams.get('sortBy') as SortField | null;
  const sortBy: SortField = sortByParam && VALID_SORT_FIELDS.includes(sortByParam) ? sortByParam : 'updated_at';
  const sortDirParam = searchParams.get('sortDir');
  const sortDirection = sortDirParam === 'asc' || sortDirParam === 'desc' ? sortDirParam : 'desc';

  const selection = useSongSelection();
  const [bulkDeleteOpen, setBulkDeleteOpen] = useState(false);
  const [bulkDeleting, setBulkDeleting] = useState(false);
  const [bulkDeleteError, setBulkDeleteError] = useState<string | null>(null);

  // Clear selection when page changes
  useEffect(() => {
    selection.clearSelection();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [currentPage]);

  const handleSort = useCallback(
    (field: SortField) => {
      const params = new URLSearchParams(searchParams);
      if (sortBy === field) {
        params.set('sortDir', sortDirection === 'asc' ? 'desc' : 'asc');
      } else {
        params.set('sortBy', field);
        params.set('sortDir', field === 'updated_at' ? 'desc' : 'asc');
      }
      params.delete('page');
      router.replace(`${pathname}?${params.toString()}`);
    },
    [searchParams, pathname, router, sortBy, sortDirection]
  );

  const handleDeleteSuccess = (_deletedSongId: string) => {
    router.refresh();
  };

  const songIds = initialSongs.map((s) => s.id);

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

      setBulkDeleteOpen(false);
      selection.clearSelection();

      if (result.deletedCount > 0) {
        router.refresh();
      }
    } catch {
      setBulkDeleteError('An unexpected error occurred');
    } finally {
      setBulkDeleting(false);
    }
  };

  return (
    <div className="space-y-6">
      <SongListHeader canManageSongs={isAdmin} />

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

      {initialSongs.length === 0 ? (
        <SongListEmpty />
      ) : (
        <>
          <SongListTable
            songs={initialSongs}
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
          <PaginationControls
            currentPage={currentPage}
            pageSize={pageSize}
            totalCount={totalCount}
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
