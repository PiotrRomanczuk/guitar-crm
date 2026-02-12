'use client';

import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import { CheckCircle2, AlertTriangle, PlusCircle, Loader2 } from 'lucide-react';
import type { CsvSongImportRowResult } from '@/schemas/CsvSongImportSchema';

interface PreviewStepProps {
  results: CsvSongImportRowResult[];
  isLoading: boolean;
  error: string | null;
  onImport: () => void;
  onBack: () => void;
}

function MatchBadge({ status, score, matchedTitle }: {
  status: string;
  score?: number;
  matchedTitle?: string;
}) {
  switch (status) {
    case 'matched':
      return (
        <Badge variant="outline" className="bg-green-500/10 text-green-700 dark:text-green-400 border-green-500/20">
          <CheckCircle2 className="mr-1 h-3 w-3" />
          Matched {score ? `(${Math.round(score * 100)}%)` : ''}
          {matchedTitle && <span className="ml-1 text-xs opacity-70">→ {matchedTitle}</span>}
        </Badge>
      );
    case 'low_confidence':
      return (
        <Badge variant="outline" className="bg-yellow-500/10 text-yellow-700 dark:text-yellow-400 border-yellow-500/20">
          <AlertTriangle className="mr-1 h-3 w-3" />
          Low match {score ? `(${Math.round(score * 100)}%)` : ''}
          {matchedTitle && <span className="ml-1 text-xs opacity-70">→ {matchedTitle}</span>}
        </Badge>
      );
    default:
      return (
        <Badge variant="outline" className="bg-blue-500/10 text-blue-700 dark:text-blue-400 border-blue-500/20">
          <PlusCircle className="mr-1 h-3 w-3" />
          New song
        </Badge>
      );
  }
}

export function PreviewStep({ results, isLoading, error, onImport, onBack }: PreviewStepProps) {
  const matched = results.filter((r) => r.matchStatus === 'matched').length;
  const lowConf = results.filter((r) => r.matchStatus === 'low_confidence').length;
  const newSongs = results.filter((r) => r.matchStatus === 'new').length;
  const errors = results.filter((r) => !r.success).length;

  return (
    <div className="space-y-4">
      <div className="flex flex-wrap gap-2">
        {matched > 0 && <Badge variant="secondary" className="bg-green-500/10">{matched} matched</Badge>}
        {lowConf > 0 && <Badge variant="secondary" className="bg-yellow-500/10">{lowConf} low confidence</Badge>}
        {newSongs > 0 && <Badge variant="secondary" className="bg-blue-500/10">{newSongs} new</Badge>}
        {errors > 0 && <Badge variant="destructive">{errors} errors</Badge>}
      </div>

      <div className="border rounded-md max-h-80 overflow-y-auto">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead className="w-28">Date</TableHead>
              <TableHead>Title</TableHead>
              <TableHead className="w-32">Author</TableHead>
              <TableHead className="w-48">Match Status</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {results.map((row, i) => (
              <TableRow key={i} className={!row.success ? 'bg-destructive/5' : ''}>
                <TableCell className="text-sm">{row.date}</TableCell>
                <TableCell className="font-medium text-sm">{row.title}</TableCell>
                <TableCell className="text-sm text-muted-foreground">{row.author || '-'}</TableCell>
                <TableCell>
                  {row.success ? (
                    <MatchBadge
                      status={row.matchStatus}
                      score={row.matchScore}
                      matchedTitle={row.matchedSongTitle}
                    />
                  ) : (
                    <Badge variant="destructive">{row.error}</Badge>
                  )}
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </div>

      {error && <p className="text-sm text-destructive">{error}</p>}

      <div className="flex gap-2 justify-end">
        <Button variant="outline" onClick={onBack} disabled={isLoading}>Back</Button>
        <Button onClick={onImport} disabled={isLoading || errors === results.length}>
          {isLoading ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : null}
          Import {results.length - errors} Songs
        </Button>
      </div>
    </div>
  );
}
