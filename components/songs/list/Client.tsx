'use client';

import { useRouter, useSearchParams, usePathname } from 'next/navigation';
import Link from 'next/link';
import type { Song } from '../types';
import SongListFilter from './Filter';
import SongListTable from './Table';
import SongListHeader from './Header';
import SongListEmpty from './Empty';
import {
  Pagination,
  PaginationContent,
  PaginationEllipsis,
  PaginationItem,
  PaginationNext,
  PaginationPrevious,
} from '@/components/ui/pagination';
import { buttonVariants } from '@/components/ui/button';
import { cn } from '@/lib/utils';

interface Props {
  initialSongs: Song[];
  isAdmin: boolean;
  students?: { id: string; full_name: string | null }[];
  selectedStudentId?: string;
  categories?: string[];
  authors?: string[];
  currentPage: number;
  totalPages: number;
}

export function SongListClient({
  initialSongs,
  isAdmin,
  students,
  selectedStudentId,
  categories,
  authors,
  currentPage,
  totalPages,
}: Props) {
  const router = useRouter();
  const searchParams = useSearchParams();
  const pathname = usePathname();

  const handleDeleteSuccess = () => {
    router.refresh();
  };

  const createPageUrl = (pageNumber: number) => {
    const params = new URLSearchParams(searchParams.toString());
    params.set('page', pageNumber.toString());
    return `${pathname}?${params.toString()}`;
  };

  return (
    <div className="space-y-6">
      <SongListHeader canManageSongs={isAdmin} />

      <SongListFilter students={students} categories={categories} authors={authors} />

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
                  {currentPage > 1 ? (
                    <Link
                      href={createPageUrl(currentPage - 1)}
                      className={cn(
                        buttonVariants({ variant: 'ghost', size: 'default' }),
                        'gap-1 px-2.5 sm:pl-2.5'
                      )}
                      aria-label="Go to previous page"
                    >
                      <svg
                        xmlns="http://www.w3.org/2000/svg"
                        width="24"
                        height="24"
                        viewBox="0 0 24 24"
                        fill="none"
                        stroke="currentColor"
                        strokeWidth="2"
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        className="h-4 w-4"
                      >
                        <path d="m15 18-6-6 6-6" />
                      </svg>
                      <span className="hidden sm:block">Previous</span>
                    </Link>
                  ) : (
                    <span
                      className={cn(
                        buttonVariants({ variant: 'ghost', size: 'default' }),
                        'gap-1 px-2.5 sm:pl-2.5 pointer-events-none opacity-50'
                      )}
                      aria-disabled="true"
                    >
                      <svg
                        xmlns="http://www.w3.org/2000/svg"
                        width="24"
                        height="24"
                        viewBox="0 0 24 24"
                        fill="none"
                        stroke="currentColor"
                        strokeWidth="2"
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        className="h-4 w-4"
                      >
                        <path d="m15 18-6-6 6-6" />
                      </svg>
                      <span className="hidden sm:block">Previous</span>
                    </span>
                  )}
                </PaginationItem>

                {Array.from({ length: totalPages }, (_, i) => i + 1).map((pageNumber) => {
                  // Show first page, last page, current page, and pages around current
                  const showPage =
                    pageNumber === 1 ||
                    pageNumber === totalPages ||
                    Math.abs(pageNumber - currentPage) <= 1;

                  if (!showPage) {
                    // Show ellipsis for gaps
                    if (pageNumber === currentPage - 2 || pageNumber === currentPage + 2) {
                      return (
                        <PaginationItem key={pageNumber}>
                          <PaginationEllipsis />
                        </PaginationItem>
                      );
                    }
                    return null;
                  }

                  return (
                    <PaginationItem key={pageNumber}>
                      <Link
                        href={createPageUrl(pageNumber)}
                        aria-current={pageNumber === currentPage ? 'page' : undefined}
                        className={cn(
                          buttonVariants({
                            variant: pageNumber === currentPage ? 'outline' : 'ghost',
                            size: 'icon',
                          })
                        )}
                      >
                        {pageNumber}
                      </Link>
                    </PaginationItem>
                  );
                })}

                <PaginationItem>
                  {currentPage < totalPages ? (
                    <Link
                      href={createPageUrl(currentPage + 1)}
                      className={cn(
                        buttonVariants({ variant: 'ghost', size: 'default' }),
                        'gap-1 px-2.5 sm:pr-2.5'
                      )}
                      aria-label="Go to next page"
                    >
                      <span className="hidden sm:block">Next</span>
                      <svg
                        xmlns="http://www.w3.org/2000/svg"
                        width="24"
                        height="24"
                        viewBox="0 0 24 24"
                        fill="none"
                        stroke="currentColor"
                        strokeWidth="2"
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        className="h-4 w-4"
                      >
                        <path d="m9 18 6-6-6-6" />
                      </svg>
                    </Link>
                  ) : (
                    <span
                      className={cn(
                        buttonVariants({ variant: 'ghost', size: 'default' }),
                        'gap-1 px-2.5 sm:pr-2.5 pointer-events-none opacity-50'
                      )}
                      aria-disabled="true"
                    >
                      <span className="hidden sm:block">Next</span>
                      <svg
                        xmlns="http://www.w3.org/2000/svg"
                        width="24"
                        height="24"
                        viewBox="0 0 24 24"
                        fill="none"
                        stroke="currentColor"
                        strokeWidth="2"
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        className="h-4 w-4"
                      >
                        <path d="m9 18 6-6-6-6" />
                      </svg>
                    </span>
                  )}
                </PaginationItem>
              </PaginationContent>
            </Pagination>
          )}
        </>
      )}
    </div>
  );
}
