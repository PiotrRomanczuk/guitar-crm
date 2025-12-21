'use client';

import { useRouter } from 'next/navigation';
import type { Song } from '../types';
import SongListFilter from './Filter';
import SongListTable from './Table';
import SongListHeader from './Header';
import SongListEmpty from './Empty';

interface Props {
  initialSongs: Song[];
  isAdmin: boolean;
  students?: { id: string; full_name: string | null }[];
  selectedStudentId?: string;
  categories?: string[];
  authors?: string[];
}

export function SongListClient({
  initialSongs,
  isAdmin,
  students,
  selectedStudentId,
  categories,
  authors,
}: Props) {
  const router = useRouter();

  const handleDeleteSuccess = () => {
    router.refresh();
  };

  return (
    <div className="space-y-6">
      <SongListHeader canManageSongs={isAdmin} />

      <SongListFilter students={students} categories={categories} authors={authors} />

      {initialSongs.length === 0 ? (
        <SongListEmpty />
      ) : (
        <SongListTable
          songs={initialSongs}
          canDelete={isAdmin}
          onDeleteSuccess={handleDeleteSuccess}
          selectedStudentId={selectedStudentId}
        />
      )}
    </div>
  );
}
