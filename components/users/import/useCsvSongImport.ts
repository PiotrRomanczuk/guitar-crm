'use client';

import { useState, useCallback } from 'react';
import type { CsvSongRow } from '@/schemas/CsvSongImportSchema';
import type { CsvSongImportResult, CsvSongImportRowResult } from '@/schemas/CsvSongImportSchema';
import { importCsvSongs } from '@/app/actions/import-csv-songs';
import { parseTextToCsvRows } from '@/app/actions/parse-text-to-csv';
import { parseCsvText } from './csvParser';
import { useAuthorMatching } from './useAuthorMatching';

export type ImportStep = 'upload' | 'preview' | 'results';

export function useCsvSongImport(studentId: string) {
  const [step, setStep] = useState<ImportStep>('upload');
  const [rows, setRows] = useState<CsvSongRow[]>([]);
  const [parseErrors, setParseErrors] = useState<Array<{ line: number; message: string }>>([]);
  const [previewResults, setPreviewResults] = useState<CsvSongImportRowResult[]>([]);
  const [importResult, setImportResult] = useState<CsvSongImportResult | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const { authors, resolveAllAuthors } = useAuthorMatching();

  const handleCsvParse = useCallback((text: string) => {
    const { rows: parsed, errors } = parseCsvText(text);
    const resolved = resolveAllAuthors(parsed);
    setRows(resolved);
    setParseErrors(errors);
    setError(null);
    return { rows: resolved, errors };
  }, [resolveAllAuthors]);

  const handleAiParse = useCallback(async (text: string) => {
    setIsLoading(true);
    setError(null);
    try {
      const result = await parseTextToCsvRows(text);
      if (result.success && result.rows) {
        const resolved = resolveAllAuthors(result.rows);
        setRows(resolved);
        setParseErrors([]);
        return { rows: resolved, errors: [] };
      }
      setError(result.error || 'AI parsing failed');
      return { rows: [], errors: [] };
    } finally {
      setIsLoading(false);
    }
  }, [resolveAllAuthors]);

  const goToPreview = useCallback(async () => {
    if (rows.length === 0) return;
    setIsLoading(true);
    setError(null);
    try {
      const result = await importCsvSongs({
        studentId,
        rows,
        validateOnly: true,
      });
      if (result.success && result.results) {
        setPreviewResults(result.results);
        setStep('preview');
      } else {
        setError(result.error || 'Preview failed');
      }
    } finally {
      setIsLoading(false);
    }
  }, [studentId, rows]);

  const runImport = useCallback(async () => {
    if (rows.length === 0) return;
    setIsLoading(true);
    setError(null);
    try {
      const result = await importCsvSongs({
        studentId,
        rows,
        validateOnly: false,
      });
      setImportResult(result);
      setStep('results');
    } finally {
      setIsLoading(false);
    }
  }, [studentId, rows]);

  const reset = useCallback(() => {
    setStep('upload');
    setRows([]);
    setParseErrors([]);
    setPreviewResults([]);
    setImportResult(null);
    setIsLoading(false);
    setError(null);
  }, []);

  return {
    step,
    rows,
    parseErrors,
    previewResults,
    importResult,
    isLoading,
    error,
    authors,
    handleCsvParse,
    handleAiParse,
    goToPreview,
    runImport,
    reset,
    setRows,
  };
}
