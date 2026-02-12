import {
  CsvSongRowSchema,
  CsvSongImportRequestSchema,
  CsvSongImportRowResultSchema,
} from '../CsvSongImportSchema';

describe('CsvSongRowSchema', () => {
  it('validates a correct row', () => {
    const result = CsvSongRowSchema.safeParse({
      date: '29.02.2024',
      title: 'Stand by Me',
      author: 'Ben E. King',
    });
    expect(result.success).toBe(true);
  });

  it('validates a row without author', () => {
    const result = CsvSongRowSchema.safeParse({
      date: '14.03.2024',
      title: 'Some Song',
    });
    expect(result.success).toBe(true);
    if (result.success) {
      expect(result.data.author).toBe('');
    }
  });

  it('rejects missing date', () => {
    const result = CsvSongRowSchema.safeParse({ title: 'Test' });
    expect(result.success).toBe(false);
  });

  it('rejects missing title', () => {
    const result = CsvSongRowSchema.safeParse({ date: '01.01.2024' });
    expect(result.success).toBe(false);
  });

  it('rejects invalid date format (YYYY-MM-DD)', () => {
    const result = CsvSongRowSchema.safeParse({
      date: '2024-01-01',
      title: 'Test',
    });
    expect(result.success).toBe(false);
  });

  it('rejects invalid date format (DD/MM/YYYY)', () => {
    const result = CsvSongRowSchema.safeParse({
      date: '01/01/2024',
      title: 'Test',
    });
    expect(result.success).toBe(false);
  });

  it('accepts edge case dates like leap day', () => {
    const result = CsvSongRowSchema.safeParse({
      date: '29.02.2024',
      title: 'Leap Day Song',
    });
    expect(result.success).toBe(true);
  });

  it('rejects title exceeding max length', () => {
    const result = CsvSongRowSchema.safeParse({
      date: '01.01.2024',
      title: 'A'.repeat(501),
    });
    expect(result.success).toBe(false);
  });

  it('rejects empty title', () => {
    const result = CsvSongRowSchema.safeParse({
      date: '01.01.2024',
      title: '',
    });
    expect(result.success).toBe(false);
  });
});

describe('CsvSongImportRequestSchema', () => {
  it('validates a correct request', () => {
    const result = CsvSongImportRequestSchema.safeParse({
      studentId: '550e8400-e29b-41d4-a716-446655440000',
      rows: [{ date: '01.01.2024', title: 'Test Song', author: '' }],
    });
    expect(result.success).toBe(true);
  });

  it('rejects invalid studentId', () => {
    const result = CsvSongImportRequestSchema.safeParse({
      studentId: 'not-a-uuid',
      rows: [{ date: '01.01.2024', title: 'Test' }],
    });
    expect(result.success).toBe(false);
  });

  it('rejects empty rows array', () => {
    const result = CsvSongImportRequestSchema.safeParse({
      studentId: '550e8400-e29b-41d4-a716-446655440000',
      rows: [],
    });
    expect(result.success).toBe(false);
  });

  it('defaults validateOnly to false', () => {
    const result = CsvSongImportRequestSchema.safeParse({
      studentId: '550e8400-e29b-41d4-a716-446655440000',
      rows: [{ date: '01.01.2024', title: 'Test' }],
    });
    expect(result.success).toBe(true);
    if (result.success) {
      expect(result.data.validateOnly).toBe(false);
    }
  });
});

describe('CsvSongImportRowResultSchema', () => {
  it('validates a successful result', () => {
    const result = CsvSongImportRowResultSchema.safeParse({
      rowIndex: 0,
      date: '01.01.2024',
      title: 'Test',
      author: 'Author',
      success: true,
      matchStatus: 'matched',
      matchScore: 0.85,
      songId: '550e8400-e29b-41d4-a716-446655440000',
      lessonCreated: false,
      songCreated: false,
    });
    expect(result.success).toBe(true);
  });

  it('validates a failed result with error', () => {
    const result = CsvSongImportRowResultSchema.safeParse({
      rowIndex: 0,
      date: '01.01.2024',
      title: 'Test',
      author: '',
      success: false,
      error: 'Invalid date',
      matchStatus: 'new',
      lessonCreated: false,
      songCreated: false,
    });
    expect(result.success).toBe(true);
  });
});
