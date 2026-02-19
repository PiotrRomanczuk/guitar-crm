'use client';

import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Card, CardContent } from '@/components/ui/card';
import { CheckCircle2, XCircle, Music, BookOpen } from 'lucide-react';
import type { CsvSongImportResult } from '@/schemas/CsvSongImportSchema';

interface ResultsStepProps {
  result: CsvSongImportResult;
  onClose: () => void;
}

export function ResultsStep({ result, onClose }: ResultsStepProps) {
  const summary = result.summary;
  const errors = result.results?.filter((r) => !r.success) || [];

  return (
    <div className="space-y-4">
      {result.success && summary ? (
        <>
          <Card>
            <CardContent className="grid grid-cols-2 gap-3 pt-4">
              <div className="flex items-center gap-2">
                <Music className="h-4 w-4 text-green-500" />
                <div>
                  <p className="text-sm font-medium">{summary.songsMatched} matched</p>
                  <p className="text-xs text-muted-foreground">Existing songs linked</p>
                </div>
              </div>
              <div className="flex items-center gap-2">
                <Music className="h-4 w-4 text-blue-500" />
                <div>
                  <p className="text-sm font-medium">{summary.songsCreated} created</p>
                  <p className="text-xs text-muted-foreground">New songs added</p>
                </div>
              </div>
              <div className="flex items-center gap-2">
                <BookOpen className="h-4 w-4 text-green-500" />
                <div>
                  <p className="text-sm font-medium">{summary.lessonsCreated} lessons created</p>
                  <p className="text-xs text-muted-foreground">{summary.lessonsExisting} already existed</p>
                </div>
              </div>
              <div className="flex items-center gap-2">
                {summary.errors > 0 ? (
                  <XCircle className="h-4 w-4 text-destructive" />
                ) : (
                  <CheckCircle2 className="h-4 w-4 text-green-500" />
                )}
                <div>
                  <p className="text-sm font-medium">
                    {summary.errors > 0 ? `${summary.errors} errors` : 'No errors'}
                  </p>
                  <p className="text-xs text-muted-foreground">{summary.totalRows} total rows</p>
                </div>
              </div>
            </CardContent>
          </Card>

          {errors.length > 0 && (
            <div className="space-y-1">
              <p className="text-sm font-medium text-destructive">Errors:</p>
              {errors.map((err, i) => (
                <div key={i} className="flex items-center gap-2 text-sm">
                  <Badge variant="destructive" className="text-xs">{err.title}</Badge>
                  <span className="text-muted-foreground">{err.error}</span>
                </div>
              ))}
            </div>
          )}
        </>
      ) : (
        <p className="text-destructive">{result.error || 'Import failed'}</p>
      )}

      <div className="flex justify-end">
        <Button onClick={onClose}>Close</Button>
      </div>
    </div>
  );
}
