'use client';

import { useState, useMemo } from 'react';
import { useRouter } from 'next/navigation';
import type { Song, SongFilters } from '../types';
import SongListFilter from './Filter';
import SongListTable from './Table';
import SongListHeader from './Header';
import SongListEmpty from './Empty';

interface Props {
  initialSongs: Song[];
  isAdmin: boolean;
}

export function SongListClient({ initialSongs, isAdmin }: Props) {
  const router = useRouter();
  const [filters, setFilters] = useState<SongFilters>({
    level: null,
    search: '',
  });

  const filteredSongs = useMemo(() => {
    return initialSongs.filter((song) => {
      // Filter by level
      if (filters.level && song.level !== filters.level) {
        return false;
      }

      // Filter by search text (title or author)
      if (filters.search) {
        const searchLower = filters.search.toLowerCase();
        const titleMatch = (song.title || '').toLowerCase().includes(searchLower);
        const authorMatch = (song.author || '').toLowerCase().includes(searchLower);
        if (!titleMatch && !authorMatch) {
          return false;
        }
      }

      return true;
    });
  }, [initialSongs, filters]);

  const handleDeleteSuccess = () => {
    router.refresh();
  };

  return (
    <div className="space-y-6">
      <SongListHeader canManageSongs={isAdmin} />

      <SongListFilter filters={filters} onChange={setFilters} />

      {filteredSongs.length === 0 ? (
        <SongListEmpty />
      ) : (
        <SongListTable
          songs={filteredSongs}
          canDelete={isAdmin}
          onDeleteSuccess={handleDeleteSuccess}
        />
      )}
    </div>
  );
}
