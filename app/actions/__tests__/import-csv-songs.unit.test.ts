import { parseEuropeanDate, groupRowsByDate } from '../import-csv-songs.helpers';
import type { CsvSongRow } from '@/schemas/CsvSongImportSchema';

describe('parseEuropeanDate', () => {
  it('parses valid DD.MM.YYYY date', () => {
    const result = parseEuropeanDate('29.02.2024');
    expect(result).not.toBeNull();
    expect(result).toContain('2024-02-29');
  });

  it('sets time to noon UTC', () => {
    const result = parseEuropeanDate('01.01.2024');
    expect(result).toContain('T12:00:00.000Z');
  });

  it('parses regular dates', () => {
    const result = parseEuropeanDate('14.03.2024');
    expect(result).not.toBeNull();
    expect(result).toContain('2024-03-14');
  });

  it('returns null for invalid date', () => {
    expect(parseEuropeanDate('32.13.2024')).toBeNull();
  });

  it('returns null for empty string', () => {
    expect(parseEuropeanDate('')).toBeNull();
  });

  it('returns null for wrong format', () => {
    expect(parseEuropeanDate('2024-01-01')).toBeNull();
  });

  it('handles end of year', () => {
    const result = parseEuropeanDate('31.12.2024');
    expect(result).toContain('2024-12-31');
  });

  it('handles start of year', () => {
    const result = parseEuropeanDate('01.01.2024');
    expect(result).toContain('2024-01-01');
  });
});

describe('groupRowsByDate', () => {
  it('groups rows by date string', () => {
    const rows: CsvSongRow[] = [
      { date: '29.02.2024', title: 'Song A', author: '' },
      { date: '29.02.2024', title: 'Song B', author: '' },
      { date: '14.03.2024', title: 'Song C', author: '' },
    ];

    const groups = groupRowsByDate(rows);
    expect(groups.size).toBe(2);
    expect(groups.get('29.02.2024')).toHaveLength(2);
    expect(groups.get('14.03.2024')).toHaveLength(1);
  });

  it('returns empty map for empty array', () => {
    const groups = groupRowsByDate([]);
    expect(groups.size).toBe(0);
  });

  it('handles single row', () => {
    const rows: CsvSongRow[] = [
      { date: '01.01.2024', title: 'Only Song', author: '' },
    ];
    const groups = groupRowsByDate(rows);
    expect(groups.size).toBe(1);
    expect(groups.get('01.01.2024')).toHaveLength(1);
  });

  it('preserves row data', () => {
    const rows: CsvSongRow[] = [
      { date: '01.01.2024', title: 'My Song', author: 'Artist' },
    ];
    const groups = groupRowsByDate(rows);
    const group = groups.get('01.01.2024')!;
    expect(group[0].title).toBe('My Song');
    expect(group[0].author).toBe('Artist');
  });
});
