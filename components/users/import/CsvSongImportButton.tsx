'use client';

import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Upload } from 'lucide-react';
import { CsvSongImportDialog } from './CsvSongImportDialog';

interface CsvSongImportButtonProps {
  studentId: string;
}

export function CsvSongImportButton({ studentId }: CsvSongImportButtonProps) {
  const [open, setOpen] = useState(false);

  return (
    <>
      <Button variant="outline" onClick={() => setOpen(true)}>
        <Upload className="mr-2 h-4 w-4" />
        Import Songs
      </Button>
      <CsvSongImportDialog studentId={studentId} open={open} onOpenChange={setOpen} />
    </>
  );
}
