'use client';

import { useState } from 'react';
import { useRouter, useSearchParams, usePathname } from 'next/navigation';
import Link from 'next/link';
import { toast } from 'sonner';
import type { Song } from '../types';
import SongListFilter from './Filter';
import SongListTable from './Table';
import SongListHeader from './Header';
import SongListEmpty from './Empty';
import BulkActionBar from './BulkActionBar';
import BulkDeleteDialog from './BulkDeleteDialog';
import { useSongSelection } from './useSongSelection';
import { bulkSoftDeleteSongs } from '@/app/actions/songs';

interface Props {
  initialSongs: Song[];
  isAdmin: boolean;
  students?: { id: string; full_name: string | null }[];
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
  const router = useRouter();
  const [sortBy, setSortBy] = useState<SortField>('updated_at');
  const [sortDirection, setSortDirection] = useState<SortDirection>('desc');

  const selection = useSongSelection();
  const [bulkDeleteOpen, setBulkDeleteOpen] = useState(false);
  const [bulkDeleting, setBulkDeleting] = useState(false);
  const [bulkDeleteError, setBulkDeleteError] = useState<string | null>(null);

  // Sort songs
  const sortedSongs = [...initialSongs].sort((a, b) => {
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

  const handleSort = (field: SortField) => {
    if (sortBy === field) {
      // Toggle direction if same field
      setSortDirection(sortDirection === 'asc' ? 'desc' : 'asc');
    } else {
      // New field - default to ascending (except updated_at which defaults to desc)
      setSortBy(field);
      setSortDirection(field === 'updated_at' ? 'desc' : 'asc');
    }
  };

  const songIds = sortedSongs.map((s) => s.id);

  const handleDeleteSuccess = () => {
    // Note: Removed router.refresh() to prevent table restart
    // The table will update on next navigation or manual refresh
    // Consider migrating to TanStack Query for real-time updates
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

      setBulkDeleteOpen(false);
      selection.clearSelection();
      // Note: Removed router.refresh() to prevent table restart
      // Consider using optimistic updates or TanStack Query
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
