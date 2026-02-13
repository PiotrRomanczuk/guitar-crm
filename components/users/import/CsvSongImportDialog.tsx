'use client';

import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { useCsvSongImport } from './useCsvSongImport';
import { UploadStep } from './CsvSongImportDialog.Upload';
import { PreviewStep } from './CsvSongImportDialog.Preview';
import { ResultsStep } from './CsvSongImportDialog.Results';

interface CsvSongImportDialogProps {
  studentId: string;
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

const STEP_TITLES: Record<string, string> = {
  upload: 'Import Songs',
  preview: 'Preview Import',
  results: 'Import Results',
};

const STEP_DESCRIPTIONS: Record<string, string> = {
  upload: 'Paste a song list or upload a CSV file to import songs and link them to lessons.',
  preview: 'Review how songs will be matched before importing.',
  results: 'Import complete. Here are the results.',
};

export function CsvSongImportDialog({ studentId, open, onOpenChange }: CsvSongImportDialogProps) {
  const {
    step, rows, parseErrors, previewResults, importResult,
    isLoading, error, authors,
    handleCsvParse, handleAiParse, goToPreview, runImport, reset, setRows,
  } = useCsvSongImport(studentId);

  const handleClose = () => {
    onOpenChange(false);
    // Refresh page if import was done
    if (step === 'results' && importResult?.success) {
      window.location.reload();
    }
    // Delay reset so dialog closes smoothly
    setTimeout(reset, 300);
  };

  return (
    <Dialog open={open} onOpenChange={(o) => !o && handleClose()}>
      <DialogContent className="max-w-2xl max-h-[85vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>{STEP_TITLES[step]}</DialogTitle>
          <DialogDescription>{STEP_DESCRIPTIONS[step]}</DialogDescription>
        </DialogHeader>

        {step === 'upload' && (
          <UploadStep
            rows={rows}
            parseErrors={parseErrors}
            isLoading={isLoading}
            error={error}
            authors={authors}
            onCsvParse={handleCsvParse}
            onAiParse={handleAiParse}
            onRowsChange={setRows}
            onNext={goToPreview}
          />
        )}

        {step === 'preview' && (
          <PreviewStep
            results={previewResults}
            isLoading={isLoading}
            error={error}
            onImport={runImport}
            onBack={() => reset()}
          />
        )}

        {step === 'results' && importResult && (
          <ResultsStep result={importResult} onClose={handleClose} />
        )}
      </DialogContent>
    </Dialog>
  );
}
