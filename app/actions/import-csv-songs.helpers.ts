import type { CsvSongRow } from '@/schemas/CsvSongImportSchema';

/**
 * Return today's date as DD.MM.YYYY (UTC).
 */
export function getTodayEuropeanDate(): string {
  const now = new Date();
  const day = String(now.getUTCDate()).padStart(2, '0');
  const month = String(now.getUTCMonth() + 1).padStart(2, '0');
  const year = now.getUTCFullYear();
  return `${day}.${month}.${year}`;
}

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
 * Rows with empty date are assigned today's date.
 * Returns a Map of date -> rows for that date.
 */
export function groupRowsByDate(rows: CsvSongRow[]): Map<string, CsvSongRow[]> {
  const today = getTodayEuropeanDate();
  const groups = new Map<string, CsvSongRow[]>();
  for (const row of rows) {
    if (!row.date) {
      row.date = today;
    }
    const existing = groups.get(row.date) || [];
    existing.push(row);
    groups.set(row.date, existing);
  }
  return groups;
}
