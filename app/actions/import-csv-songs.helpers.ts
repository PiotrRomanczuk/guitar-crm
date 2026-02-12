import type { CsvSongRow } from '@/schemas/CsvSongImportSchema';

/**
 * Parse DD.MM.YYYY date string to ISO datetime string (noon UTC).
 * Returns null if invalid.
 */
export function parseEuropeanDate(dateStr: string): string | null {
  const match = dateStr.match(/^(\d{2})\.(\d{2})\.(\d{4})$/);
  if (!match) return null;

  const day = parseInt(match[1], 10);
  const month = parseInt(match[2], 10);
  const year = parseInt(match[3], 10);

  // Construct directly in UTC to avoid timezone shifts
  const date = new Date(Date.UTC(year, month - 1, day, 12, 0, 0, 0));

  // Validate the date components didn't overflow (e.g. Feb 30)
  if (
    date.getUTCFullYear() !== year ||
    date.getUTCMonth() !== month - 1 ||
    date.getUTCDate() !== day
  ) {
    return null;
  }

  return date.toISOString();
}

/**
 * Group CSV rows by date string (original DD.MM.YYYY).
 * Returns a Map of date -> rows for that date.
 */
export function groupRowsByDate(rows: CsvSongRow[]): Map<string, CsvSongRow[]> {
  const groups = new Map<string, CsvSongRow[]>();
  for (const row of rows) {
    const existing = groups.get(row.date) || [];
    existing.push(row);
    groups.set(row.date, existing);
  }
  return groups;
}
