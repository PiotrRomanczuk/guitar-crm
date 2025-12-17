'use client';

import { useRouter, useSearchParams, usePathname } from 'next/navigation';
import { useEffect } from 'react';
import type { Song } from '../types';
import SongListFilter from './Filter';
import SongListTable from './Table';
import SongListHeader from './Header';
import SongListEmpty from './Empty';
import {
  Pagination,
  PaginationContent,
  PaginationItem,
  PaginationLink,
  PaginationNext,
  PaginationPrevious,
} from '@/components/ui/pagination';

interface Props {
  initialSongs: Song[];
  isAdmin: boolean;
  students?: { id: string; full_name: string | null }[];
  selectedStudentId?: string;
  totalPages: number;
  currentPage: number;
  pageSize: number;
}

export function SongListClient({
  initialSongs,
  isAdmin,
  students,
  selectedStudentId,
  totalPages,
  currentPage,
  pageSize,
}: Props) {
  const router = useRouter();
  const searchParams = useSearchParams();
  const pathname = usePathname();

  useEffect(() => {
    // Only auto-adjust if pageSize is not explicitly set in URL
    const params = new URLSearchParams(searchParams);
    if (!params.has('pageSize')) {
      const rowHeight = 53; // Approximate row height
      const otherContentHeight = 300; // Header, filters, pagination, padding
      const availableHeight = window.innerHeight - otherContentHeight;
      const calculatedPageSize = Math.max(5, Math.floor(availableHeight / rowHeight));

      // Snap to nearest 5 to keep it clean, minimum 10
      const snappedSize = Math.max(10, Math.ceil(calculatedPageSize / 5) * 5);

      // Only update if significantly different from default (15) to avoid unnecessary reloads on standard screens
      // But user asked for "dependent on browser height", so we should probably respect it if it's different.
      if (snappedSize !== pageSize) {
        params.set('pageSize', snappedSize.toString());
         router.replace(`${pathname}?${params.toString()}`);
      }
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []); // Run once on mount

  const handleDeleteSuccess = () => {
    router.refresh();
  };

  const createPageURL = (pageNumber: number | string) => {
    const params = new URLSearchParams(searchParams);
    params.set('page', pageNumber.toString());
    // Preserve pageSize
    if (pageSize) {
      params.set('pageSize', pageSize.toString());
    }
    return `${pathname}?${params.toString()}`;
  };

  return (
    <div className="space-y-6">
      <SongListHeader canManageSongs={isAdmin} />

      <SongListFilter students={students} />

      {initialSongs.length === 0 ? (
        <SongListEmpty />
      ) : (
        <>
          <SongListTable
            songs={initialSongs}
            canDelete={isAdmin}
            onDeleteSuccess={handleDeleteSuccess}
            selectedStudentId={selectedStudentId}
          />

          {totalPages > 1 && (
            <Pagination>
              <PaginationContent>
                <PaginationItem>
                  <PaginationPrevious
                    href={createPageURL(currentPage - 1)}
                    aria-disabled={currentPage <= 1}
                    tabIndex={currentPage <= 1 ? -1 : undefined}
                    className={currentPage <= 1 ? 'pointer-events-none opacity-50' : undefined}
                  />
                </PaginationItem>
                {Array.from({ length: totalPages }, (_, i) => i + 1).map((page) => (
                  <PaginationItem key={page}>
                    <PaginationLink href={createPageURL(page)} isActive={page === currentPage}>
                      {page}
                    </PaginationLink>
                  </PaginationItem>
                ))}
                <PaginationItem>
                  <PaginationNext
                    href={createPageURL(currentPage + 1)}
                    aria-disabled={currentPage >= totalPages}
                    tabIndex={currentPage >= totalPages ? -1 : undefined}
                    className={
                      currentPage >= totalPages ? 'pointer-events-none opacity-50' : undefined
                    }
                  />
                </PaginationItem>
              </PaginationContent>
            </Pagination>
          )}
        </>
      )}
    </div>
  );
}
