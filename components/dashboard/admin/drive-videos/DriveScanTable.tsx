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

export interface ScanResult {
  filename: string;
  driveFileId: string;
  parsed: { title: string; author: string } | null;
  status: 'matched' | 'ambiguous' | 'unmatched' | 'skipped';
  bestMatch: {
    songId: string;
    title: string;
    author: string;
    score: number;
  } | null;
  runnerUp: {
    songId: string;
    title: string;
    author: string;
    score: number;
  } | null;
}

interface DriveScanTableProps {
  results: ScanResult[];
}

function getStatusBadge(status: ScanResult['status']) {
  switch (status) {
    case 'matched':
      return <Badge className="bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-400">Matched</Badge>;
    case 'ambiguous':
      return <Badge className="bg-yellow-100 text-yellow-800 dark:bg-yellow-900/30 dark:text-yellow-400">Ambiguous</Badge>;
    case 'unmatched':
      return <Badge className="bg-red-100 text-red-800 dark:bg-red-900/30 dark:text-red-400">Unmatched</Badge>;
    case 'skipped':
      return <Badge variant="secondary">Skipped</Badge>;
  }
}

function getScoreColor(score: number): string {
  if (score >= 80) return 'text-green-600 dark:text-green-400';
  if (score >= 50) return 'text-yellow-600 dark:text-yellow-400';
  return 'text-red-600 dark:text-red-400';
}

export function DriveScanTable({ results }: DriveScanTableProps) {
  return (
    <>
      {/* Desktop table */}
      <div className="hidden md:block rounded-lg border border-border overflow-hidden">
        <Table>
          <TableHeader>
            <TableRow className="bg-muted/50">
              <TableHead>Filename</TableHead>
              <TableHead>Parsed Title</TableHead>
              <TableHead>Best Match</TableHead>
              <TableHead className="w-[70px]">Score</TableHead>
              <TableHead className="w-[100px]">Status</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {results.map((result) => (
              <TableRow key={result.driveFileId} className="hover:bg-muted/50">
                <TableCell>
                  <span className="text-xs font-mono line-clamp-1">{result.filename}</span>
                </TableCell>
                <TableCell>
                  {result.parsed ? (
                    <div className="space-y-0.5">
                      <div className="text-sm">{result.parsed.title}</div>
                      <div className="text-xs text-muted-foreground">{result.parsed.author}</div>
                    </div>
                  ) : (
                    <span className="text-xs text-muted-foreground italic">Could not parse</span>
                  )}
                </TableCell>
                <TableCell>
                  {result.bestMatch ? (
                    <div className="space-y-0.5">
                      <div className="text-sm">{result.bestMatch.title}</div>
                      <div className="text-xs text-muted-foreground">{result.bestMatch.author}</div>
                    </div>
                  ) : (
                    <span className="text-xs text-muted-foreground">--</span>
                  )}
                </TableCell>
                <TableCell>
                  {result.bestMatch ? (
                    <span className={`text-sm font-semibold ${getScoreColor(result.bestMatch.score)}`}>
                      {result.bestMatch.score}
                    </span>
                  ) : (
                    <span className="text-xs text-muted-foreground">--</span>
                  )}
                </TableCell>
                <TableCell>{getStatusBadge(result.status)}</TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </div>

      {/* Mobile card layout */}
      <div className="md:hidden space-y-3">
        {results.map((result) => (
          <div key={result.driveFileId} className="rounded-lg border border-border p-4 space-y-2">
            <div className="flex items-start justify-between gap-2">
              <span className="text-xs font-mono truncate flex-1">{result.filename}</span>
              {getStatusBadge(result.status)}
            </div>
            {result.parsed && (
              <div className="text-sm">
                {result.parsed.title} <span className="text-muted-foreground">by {result.parsed.author}</span>
              </div>
            )}
            {result.bestMatch && (
              <div className="flex items-center justify-between">
                <span className="text-xs text-muted-foreground">
                  Best: {result.bestMatch.title} - {result.bestMatch.author}
                </span>
                <span className={`text-sm font-semibold ${getScoreColor(result.bestMatch.score)}`}>
                  {result.bestMatch.score}
                </span>
              </div>
            )}
          </div>
        ))}
      </div>
    </>
  );
}
