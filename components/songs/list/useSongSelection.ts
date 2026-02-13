'use client';

import { useState, useCallback, useMemo } from 'react';

export function useSongSelection() {
  const [selectedIds, setSelectedIds] = useState<Set<string>>(new Set());

  const isSelected = useCallback(
    (id: string) => selectedIds.has(id),
    [selectedIds]
  );

  const toggleSelect = useCallback((id: string) => {
    setSelectedIds((prev) => {
      const next = new Set(prev);
      if (next.has(id)) {
        next.delete(id);
      } else {
        next.add(id);
      }
      return next;
    });
  }, []);

  const toggleSelectAll = useCallback((songIds: string[]) => {
    setSelectedIds((prev) => {
      const allSelected = songIds.every((id) => prev.has(id));
      if (allSelected) {
        return new Set();
      }
      return new Set(songIds);
    });
  }, []);

  const clearSelection = useCallback(() => {
    setSelectedIds(new Set());
  }, []);

  const selectedCount = selectedIds.size;

  const isAllSelected = useCallback(
    (songIds: string[]) =>
      songIds.length > 0 && songIds.every((id) => selectedIds.has(id)),
    [selectedIds]
  );

  const isIndeterminate = useCallback(
    (songIds: string[]) => {
      const count = songIds.filter((id) => selectedIds.has(id)).length;
      return count > 0 && count < songIds.length;
    },
    [selectedIds]
  );

  return useMemo(
    () => ({
      selectedIds,
      selectedCount,
      isSelected,
      toggleSelect,
      toggleSelectAll,
      clearSelection,
      isAllSelected,
      isIndeterminate,
    }),
    [selectedIds, selectedCount, isSelected, toggleSelect, toggleSelectAll, clearSelection, isAllSelected, isIndeterminate]
  );
}
