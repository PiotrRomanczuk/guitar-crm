'use client';

import { useSearchParams, usePathname } from 'next/navigation';
import {
  Pagination,
  PaginationContent,
  PaginationItem,
  PaginationLink,
  PaginationPrevious,
  PaginationNext,
  PaginationEllipsis,
} from '@/components/ui/pagination';

interface Props {
  currentPage: number;
  pageSize: number;
  totalCount: number;
}

function buildPageUrl(
  pathname: string,
  searchParams: URLSearchParams,
  page: number
): string {
  const params = new URLSearchParams(searchParams);
  if (page <= 1) {
    params.delete('page');
  } else {
    params.set('page', String(page));
  }
  const qs = params.toString();
  return qs ? `${pathname}?${qs}` : pathname;
}

function getPageNumbers(current: number, total: number): (number | 'ellipsis')[] {
  if (total <= 7) return Array.from({ length: total }, (_, i) => i + 1);

  const pages: (number | 'ellipsis')[] = [1];

  if (current > 3) pages.push('ellipsis');

  const start = Math.max(2, current - 1);
  const end = Math.min(total - 1, current + 1);
  for (let i = start; i <= end; i++) pages.push(i);

  if (current < total - 2) pages.push('ellipsis');

  pages.push(total);
  return pages;
}

export default function PaginationControls({ currentPage, pageSize, totalCount }: Props) {
  const searchParams = useSearchParams();
  const pathname = usePathname();

  const totalPages = Math.ceil(totalCount / pageSize);
  if (totalPages <= 1) return null;

  const start = (currentPage - 1) * pageSize + 1;
  const end = Math.min(currentPage * pageSize, totalCount);
  const pages = getPageNumbers(currentPage, totalPages);

  return (
    <div className="flex flex-col items-center gap-3">
      <p className="text-sm text-muted-foreground">
        Showing {start}-{end} of {totalCount} songs
      </p>
      <Pagination>
        <PaginationContent>
          <PaginationItem>
            <PaginationPrevious
              href={currentPage > 1 ? buildPageUrl(pathname, searchParams, currentPage - 1) : undefined}
              aria-disabled={currentPage <= 1}
              className={currentPage <= 1 ? 'pointer-events-none opacity-50' : undefined}
            />
          </PaginationItem>

          {pages.map((p, i) =>
            p === 'ellipsis' ? (
              <PaginationItem key={`ellipsis-${i}`}>
                <PaginationEllipsis />
              </PaginationItem>
            ) : (
              <PaginationItem key={p}>
                <PaginationLink
                  href={buildPageUrl(pathname, searchParams, p)}
                  isActive={p === currentPage}
                >
                  {p}
                </PaginationLink>
              </PaginationItem>
            )
          )}

          <PaginationItem>
            <PaginationNext
              href={currentPage < totalPages ? buildPageUrl(pathname, searchParams, currentPage + 1) : undefined}
              aria-disabled={currentPage >= totalPages}
              className={currentPage >= totalPages ? 'pointer-events-none opacity-50' : undefined}
            />
          </PaginationItem>
        </PaginationContent>
      </Pagination>
    </div>
  );
}
