'use client';

import * as React from 'react';
import { cn } from '@/lib/utils';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import { Skeleton } from '@/components/ui/skeleton';
import { EmptyState, type EmptyStateProps } from '@/components/ui/empty-state';

/**
 * DataTable - Standard table wrapper with loading/empty states
 * Follows CLAUDE.md Table Standards (Section 11)
 *
 * Features:
 * - Desktop table with horizontal scroll
 * - Mobile card view (via renderMobileCard prop)
 * - Skeleton loading state
 * - Empty state with icon, heading, message, CTA
 * - Consistent container styling
 */

interface Column<T> {
  key: string;
  header: string;
  className?: string;
  render?: (item: T) => React.ReactNode;
}

interface DataTableProps<T> {
  data: T[];
  columns: Column<T>[];
  keyExtractor: (item: T) => string;
  isLoading?: boolean;
  emptyState?: EmptyStateProps;
  renderMobileCard?: (item: T) => React.ReactNode;
  onRowClick?: (item: T) => void;
  className?: string;
  minWidth?: string;
}

export function DataTable<T>({
  data,
  columns,
  keyExtractor,
  isLoading = false,
  emptyState,
  renderMobileCard,
  onRowClick,
  className,
  minWidth = 'min-w-[600px]',
}: DataTableProps<T>) {
  // Loading state
  if (isLoading) {
    return (
      <div className={cn('bg-card rounded-xl border border-border shadow-sm overflow-hidden', className)}>
        {/* Mobile skeleton */}
        {renderMobileCard && (
          <div className="md:hidden space-y-3 p-4">
            {[1, 2, 3].map((i) => (
              <div key={i} className="rounded-lg border p-4 space-y-3">
                <Skeleton className="h-5 w-3/4" />
                <Skeleton className="h-4 w-1/2" />
                <Skeleton className="h-4 w-1/4" />
              </div>
            ))}
          </div>
        )}
        {/* Desktop skeleton */}
        <div className={cn('overflow-x-auto', renderMobileCard && 'hidden md:block')}>
          <TableSkeleton columns={columns.length} rows={5} minWidth={minWidth} />
        </div>
      </div>
    );
  }

  // Empty state
  if (data.length === 0) {
    return (
      <div className={cn('bg-card rounded-xl border border-border shadow-sm overflow-hidden', className)}>
        <EmptyState {...emptyState} />
      </div>
    );
  }

  return (
    <div className={cn('bg-card rounded-xl border border-border shadow-sm overflow-hidden', className)}>
      {/* Mobile cards */}
      {renderMobileCard && (
        <div className="md:hidden space-y-3 p-4">
          {data.map((item) => (
            <div
              key={keyExtractor(item)}
              className={cn(
                'rounded-lg border p-4 hover:bg-muted/50 transition-colors',
                onRowClick && 'cursor-pointer'
              )}
              onClick={() => onRowClick?.(item)}
            >
              {renderMobileCard(item)}
            </div>
          ))}
        </div>
      )}

      {/* Desktop table */}
      <div className={cn('overflow-x-auto', renderMobileCard && 'hidden md:block')}>
        <Table className={minWidth}>
          <TableHeader>
            <TableRow className="hover:bg-transparent">
              {columns.map((column) => (
                <TableHead key={column.key} className={column.className}>
                  {column.header}
                </TableHead>
              ))}
            </TableRow>
          </TableHeader>
          <TableBody>
            {data.map((item) => (
              <TableRow
                key={keyExtractor(item)}
                className={cn(
                  'hover:bg-muted/50 transition-colors',
                  onRowClick && 'cursor-pointer'
                )}
                onClick={() => onRowClick?.(item)}
              >
                {columns.map((column) => (
                  <TableCell key={column.key} className={column.className}>
                    {column.render
                      ? column.render(item)
                      : (item as Record<string, unknown>)[column.key] as React.ReactNode}
                  </TableCell>
                ))}
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </div>
    </div>
  );
}

/**
 * TableSkeleton - Loading skeleton for tables
 */
interface TableSkeletonProps {
  columns: number;
  rows?: number;
  minWidth?: string;
}

export function TableSkeleton({ columns, rows = 5, minWidth = 'min-w-[600px]' }: TableSkeletonProps) {
  return (
    <Table className={minWidth}>
      <TableHeader>
        <TableRow className="hover:bg-transparent">
          {Array.from({ length: columns }).map((_, i) => (
            <TableHead key={i}>
              <Skeleton className="h-4 w-24" />
            </TableHead>
          ))}
        </TableRow>
      </TableHeader>
      <TableBody>
        {Array.from({ length: rows }).map((_, rowIndex) => (
          <TableRow key={rowIndex}>
            {Array.from({ length: columns }).map((_, colIndex) => (
              <TableCell key={colIndex}>
                <Skeleton className="h-4 w-full max-w-[200px]" />
              </TableCell>
            ))}
          </TableRow>
        ))}
      </TableBody>
    </Table>
  );
}

/**
 * TableActions - Container for row action buttons
 * Use with stopPropagation to prevent row click
 */
interface TableActionsProps {
  children: React.ReactNode;
  className?: string;
}

export function TableActions({ children, className }: TableActionsProps) {
  return (
    <div
      className={cn('flex items-center justify-end gap-2', className)}
      onClick={(e) => e.stopPropagation()}
    >
      {children}
    </div>
  );
}
