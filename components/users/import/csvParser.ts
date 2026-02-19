import type { CsvSongRow } from '@/schemas/CsvSongImportSchema';

/**
 * Auto-detect delimiter by checking which appears more in the first line
 */
function detectDelimiter(text: string): string {
  const firstLine = text.split('\n')[0] || '';
  const semicolons = (firstLine.match(/;/g) || []).length;
  const commas = (firstLine.match(/,/g) || []).length;
  return semicolons >= commas ? ';' : ',';
}

/**
 * Parse CSV text into CsvSongRow[]. Auto-detects delimiter (semicolon or comma).
 * Expects header row: date, title, author
 */
export function parseCsvText(text: string): {
  rows: CsvSongRow[];
  errors: Array<{ line: number; message: string }>;
} {
  const lines = text
    .trim()
    .split('\n')
    .map((l) => l.trim())
    .filter((l) => l.length > 0);

  if (lines.length < 2) {
    return { rows: [], errors: [{ line: 1, message: 'CSV must have a header row and at least one data row' }] };
  }

  const delimiter = detectDelimiter(lines[0]);
  const headers = lines[0].split(delimiter).map((h) => h.trim().toLowerCase());

  const dateIdx = headers.indexOf('date');
  const titleIdx = headers.indexOf('title');
  const authorIdx = headers.indexOf('author');

  if (titleIdx === -1) {
    return { rows: [], errors: [{ line: 1, message: 'CSV must have a "title" column' }] };
  }

  const rows: CsvSongRow[] = [];
  const errors: Array<{ line: number; message: string }> = [];

  for (let i = 1; i < lines.length; i++) {
    const cols = lines[i].split(delimiter).map((c) => c.trim());
    const date = dateIdx !== -1 ? cols[dateIdx] || '' : '';
    const title = cols[titleIdx] || '';
    const author = authorIdx !== -1 ? cols[authorIdx] || '' : '';

    if (!title) {
      errors.push({ line: i + 1, message: 'Missing title' });
      continue;
    }

    rows.push({ date, title, author });
  }

  return { rows, errors };
}
