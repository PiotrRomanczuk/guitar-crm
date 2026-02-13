'use client';

import { useState, useEffect, useCallback } from 'react';
import { getDistinctAuthors } from '@/app/actions/get-authors';
import { calculateSimilarity } from '@/lib/utils/string-similarity';
import type { CsvSongRow } from '@/schemas/CsvSongImportSchema';

const SIMILARITY_THRESHOLD = 80;

export function useAuthorMatching() {
  const [authors, setAuthors] = useState<string[]>([]);

  useEffect(() => {
    getDistinctAuthors().then(setAuthors).catch(() => setAuthors([]));
  }, []);

  const resolveAuthor = useCallback(
    (input: string): string => {
      if (!input.trim() || authors.length === 0) return input;

      let bestMatch = '';
      let bestScore = 0;

      for (const author of authors) {
        const score = calculateSimilarity(input, author);
        if (score > bestScore) {
          bestScore = score;
          bestMatch = author;
        }
      }

      return bestScore >= SIMILARITY_THRESHOLD ? bestMatch : input;
    },
    [authors]
  );

  const resolveAllAuthors = useCallback(
    (rows: CsvSongRow[]): CsvSongRow[] => {
      if (authors.length === 0) return rows;
      return rows.map((row) => ({
        ...row,
        author: resolveAuthor(row.author ?? ''),
      }));
    },
    [authors, resolveAuthor]
  );

  return { authors, resolveAuthor, resolveAllAuthors };
}
