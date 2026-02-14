'use client';

import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { ExternalLink } from 'lucide-react';
import Link from 'next/link';

export interface DuplicateVideo {
  filename: string;
  driveFileId: string;
  existingSongVideo: {
    id: string;
    songId: string;
    songTitle: string;
    uploadedAt: string;
  };
}

interface DuplicatesTableProps {
  duplicates: DuplicateVideo[];
}

function formatDate(dateString: string): string {
  const date = new Date(dateString);
  return date.toLocaleDateString('en-US', {
    year: 'numeric',
    month: 'short',
    day: 'numeric',
  });
}

export function DuplicatesTable({ duplicates }: DuplicatesTableProps) {
  return (
    <>
      {/* Desktop table */}
      <div className="hidden md:block rounded-lg border border-border overflow-hidden">
        <Table>
          <TableHeader>
            <TableRow className="bg-muted/50">
              <TableHead>Filename</TableHead>
              <TableHead>Already Linked To</TableHead>
              <TableHead>Uploaded On</TableHead>
              <TableHead className="w-[100px]">Action</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {duplicates.map((dup) => (
              <TableRow key={dup.driveFileId} className="hover:bg-muted/50">
                <TableCell>
                  <span className="text-xs font-mono line-clamp-1">{dup.filename}</span>
                  <Badge variant="secondary" className="mt-1">Duplicate</Badge>
                </TableCell>
                <TableCell>
                  <div className="space-y-0.5">
                    <div className="text-sm font-medium">{dup.existingSongVideo.songTitle}</div>
                    <div className="text-xs text-muted-foreground">Song ID: {dup.existingSongVideo.songId.slice(0, 8)}...</div>
                  </div>
                </TableCell>
                <TableCell>
                  <span className="text-sm">{formatDate(dup.existingSongVideo.uploadedAt)}</span>
                </TableCell>
                <TableCell>
                  <Link href={`/dashboard/songs/${dup.existingSongVideo.songId}`} passHref>
                    <Button variant="outline" size="sm" className="h-8">
                      <ExternalLink className="w-4 h-4 mr-1" />
                      View Song
                    </Button>
                  </Link>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </div>

      {/* Mobile card layout */}
      <div className="md:hidden space-y-3">
        {duplicates.map((dup) => (
          <div key={dup.driveFileId} className="rounded-lg border border-border p-4 space-y-3">
            <div className="flex items-start justify-between gap-2">
              <span className="text-xs font-mono line-clamp-2 flex-1">{dup.filename}</span>
              <Badge variant="secondary">Duplicate</Badge>
            </div>
            <div className="space-y-1">
              <div className="text-xs text-muted-foreground">Already linked to:</div>
              <div className="text-sm font-medium">{dup.existingSongVideo.songTitle}</div>
              <div className="text-xs text-muted-foreground">Uploaded: {formatDate(dup.existingSongVideo.uploadedAt)}</div>
            </div>
            <Link href={`/dashboard/songs/${dup.existingSongVideo.songId}`} passHref>
              <Button variant="outline" size="sm" className="w-full">
                <ExternalLink className="w-4 h-4 mr-2" />
                View Song
              </Button>
            </Link>
          </div>
        ))}
      </div>
    </>
  );
}
