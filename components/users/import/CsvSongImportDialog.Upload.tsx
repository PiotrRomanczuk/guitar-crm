'use client';

import { useState, useCallback, useRef } from 'react';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Badge } from '@/components/ui/badge';
import { Loader2, Upload, Sparkles, FileText } from 'lucide-react';
import type { CsvSongRow } from '@/schemas/CsvSongImportSchema';
import { EditableSongList } from './CsvSongImportDialog.EditableSongList';

interface UploadStepProps {
  rows: CsvSongRow[];
  parseErrors: Array<{ line: number; message: string }>;
  isLoading: boolean;
  error: string | null;
  authors?: string[];
  onCsvParse: (text: string) => { rows: CsvSongRow[]; errors: Array<{ line: number; message: string }> };
  onAiParse: (text: string) => Promise<{ rows: CsvSongRow[]; errors: Array<{ line: number; message: string }> }>;
  onRowsChange: (rows: CsvSongRow[]) => void;
  onNext: () => void;
}

export function UploadStep({
  rows,
  parseErrors,
  isLoading,
  error,
  authors,
  onCsvParse,
  onAiParse,
  onRowsChange,
  onNext,
}: UploadStepProps) {
  const [freeText, setFreeText] = useState('');
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleFileSelect = useCallback(
    (e: React.ChangeEvent<HTMLInputElement>) => {
      const file = e.target.files?.[0];
      if (!file) return;

      const reader = new FileReader();
      reader.onload = (ev) => {
        const text = ev.target?.result as string;
        if (file.name.endsWith('.csv')) {
          onCsvParse(text);
        } else {
          setFreeText(text);
        }
      };
      reader.readAsText(file, 'UTF-8');
    },
    [onCsvParse]
  );

  const handleDrop = useCallback(
    (e: React.DragEvent) => {
      e.preventDefault();
      const file = e.dataTransfer.files[0];
      if (!file) return;

      const reader = new FileReader();
      reader.onload = (ev) => {
        const text = ev.target?.result as string;
        if (file.name.endsWith('.csv')) {
          onCsvParse(text);
        } else {
          setFreeText(text);
        }
      };
      reader.readAsText(file, 'UTF-8');
    },
    [onCsvParse]
  );

  const handleAiParseClick = useCallback(async () => {
    if (!freeText.trim()) return;
    await onAiParse(freeText);
  }, [freeText, onAiParse]);

  return (
    <Tabs defaultValue="ai" className="w-full">
      <TabsList className="grid w-full grid-cols-2">
        <TabsTrigger value="ai">
          <Sparkles className="mr-2 h-4 w-4" />
          Paste Text (AI)
        </TabsTrigger>
        <TabsTrigger value="csv">
          <FileText className="mr-2 h-4 w-4" />
          Upload CSV
        </TabsTrigger>
      </TabsList>

      <TabsContent value="ai" className="space-y-3 mt-3">
        <p className="text-sm text-muted-foreground">
          Paste a song list in any format. AI will extract dates, titles, and authors.
        </p>
        <Textarea
          placeholder={"29.02.2024: Stand by me, Son of the blue sky\n14.03.2024: Crazy Little Thing Called Love - Queen"}
          rows={8}
          value={freeText}
          onChange={(e) => setFreeText(e.target.value)}
        />
        <div className="flex items-center gap-2">
          <Button onClick={handleAiParseClick} disabled={isLoading || !freeText.trim()} size="sm">
            {isLoading ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : <Sparkles className="mr-2 h-4 w-4" />}
            Parse with AI
          </Button>
          <span className="text-xs text-muted-foreground">or</span>
          <Button
            variant="outline"
            size="sm"
            onClick={() => fileInputRef.current?.click()}
          >
            <Upload className="mr-2 h-4 w-4" />
            Upload .txt
          </Button>
          <input
            ref={fileInputRef}
            type="file"
            accept=".txt,.csv"
            className="hidden"
            onChange={handleFileSelect}
          />
        </div>
      </TabsContent>

      <TabsContent value="csv" className="space-y-3 mt-3">
        <p className="text-sm text-muted-foreground">
          Upload a CSV file with columns: date, title, author. Delimiter auto-detected.
        </p>
        <div
          className="border-2 border-dashed rounded-lg p-8 text-center cursor-pointer hover:border-primary/50 transition-colors"
          onDrop={handleDrop}
          onDragOver={(e) => e.preventDefault()}
          onClick={() => fileInputRef.current?.click()}
        >
          <Upload className="mx-auto h-8 w-8 text-muted-foreground mb-2" />
          <p className="text-sm text-muted-foreground">Drop CSV file here or click to browse</p>
          <p className="text-xs text-muted-foreground mt-1">Expects: date;title;author (DD.MM.YYYY)</p>
        </div>
      </TabsContent>

      {error && <p className="text-sm text-destructive mt-2">{error}</p>}

      {parseErrors.length > 0 && (
        <div className="mt-3 space-y-1">
          {parseErrors.map((err, i) => (
            <p key={i} className="text-sm text-destructive">Line {err.line}: {err.message}</p>
          ))}
        </div>
      )}

      {rows.length > 0 && (
        <div className="mt-3 space-y-3">
          <div className="flex items-center gap-2">
            <Badge variant="secondary">{rows.length} songs parsed</Badge>
            {rows.some((r) => r.date) ? (
              <Badge variant="outline">{new Set(rows.filter((r) => r.date).map((r) => r.date)).size} dates</Badge>
            ) : (
              <Badge variant="outline" className="bg-amber-500/10 text-amber-700 dark:text-amber-400 border-amber-500/20">
                No dates — will use today
              </Badge>
            )}
          </div>
          <EditableSongList rows={rows} onRowsChange={onRowsChange} authors={authors} />
          <Button onClick={onNext} disabled={isLoading}>
            {isLoading ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : null}
            Preview Import
          </Button>
        </div>
      )}
    </Tabs>
  );
}
