'use client';

import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { X } from 'lucide-react';
import type { CsvSongRow } from '@/schemas/CsvSongImportSchema';

interface EditableSongListProps {
  rows: CsvSongRow[];
  onRowsChange: (rows: CsvSongRow[]) => void;
}

export function EditableSongList({ rows, onRowsChange }: EditableSongListProps) {
  const updateRow = (index: number, field: keyof CsvSongRow, value: string) => {
    const updated = rows.map((row, i) =>
      i === index ? { ...row, [field]: value } : row
    );
    onRowsChange(updated);
  };

  const removeRow = (index: number) => {
    onRowsChange(rows.filter((_, i) => i !== index));
  };

  const visible = rows.slice(0, 20);
  const overflow = rows.length - 20;

  return (
    <div className="max-h-40 overflow-y-auto border rounded-md p-2 space-y-1">
      {visible.map((row, i) => (
        <div key={i} className="flex items-center gap-1.5">
          <Input
            value={row.title}
            onChange={(e) => updateRow(i, 'title', e.target.value)}
            className="h-7 text-sm font-medium flex-1"
            placeholder="Song title"
          />
          <Input
            value={row.author}
            onChange={(e) => updateRow(i, 'author', e.target.value)}
            className="h-7 text-sm w-32 shrink-0"
            placeholder="Author"
          />
          {row.date && (
            <span className="text-xs text-muted-foreground w-20 shrink-0 text-right">
              {row.date}
            </span>
          )}
          <Button
            variant="ghost"
            size="icon"
            className="h-7 w-7 shrink-0"
            onClick={() => removeRow(i)}
          >
            <X className="h-3.5 w-3.5" />
          </Button>
        </div>
      ))}
      {overflow > 0 && (
        <p className="text-muted-foreground text-xs mt-1">
          ...and {overflow} more
        </p>
      )}
    </div>
  );
}
