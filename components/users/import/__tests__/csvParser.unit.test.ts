import { parseCsvText } from '../csvParser';

describe('parseCsvText', () => {
  it('parses semicolon-delimited CSV', () => {
    const csv = 'date;title;author\n29.02.2024;Stand by Me;Ben E. King';
    const { rows, errors } = parseCsvText(csv);
    expect(errors).toHaveLength(0);
    expect(rows).toHaveLength(1);
    expect(rows[0]).toEqual({
      date: '29.02.2024',
      title: 'Stand by Me',
      author: 'Ben E. King',
    });
  });

  it('parses comma-delimited CSV', () => {
    const csv = 'date,title,author\n29.02.2024,Stand by Me,Ben E. King';
    const { rows, errors } = parseCsvText(csv);
    expect(errors).toHaveLength(0);
    expect(rows).toHaveLength(1);
    expect(rows[0].title).toBe('Stand by Me');
  });

  it('auto-detects semicolon when both present', () => {
    const csv = 'date;title;author\n29.02.2024;Stand by Me;Ben E. King';
    const { rows } = parseCsvText(csv);
    expect(rows).toHaveLength(1);
    expect(rows[0].title).toBe('Stand by Me');
  });

  it('handles missing author column', () => {
    const csv = 'date;title\n29.02.2024;Stand by Me';
    const { rows, errors } = parseCsvText(csv);
    expect(errors).toHaveLength(0);
    expect(rows).toHaveLength(1);
    expect(rows[0].author).toBe('');
  });

  it('handles empty author value', () => {
    const csv = 'date;title;author\n29.02.2024;Stand by Me;';
    const { rows } = parseCsvText(csv);
    expect(rows).toHaveLength(1);
    expect(rows[0].author).toBe('');
  });

  it('handles multiple rows', () => {
    const csv = [
      'date;title;author',
      '29.02.2024;Stand by Me;Ben E. King',
      '29.02.2024;Son of the Blue Sky;',
      '14.03.2024;Crazy Little Thing Called Love;Queen',
    ].join('\n');
    const { rows, errors } = parseCsvText(csv);
    expect(errors).toHaveLength(0);
    expect(rows).toHaveLength(3);
  });

  it('skips empty lines', () => {
    const csv = 'date;title;author\n29.02.2024;Song 1;Author\n\n14.03.2024;Song 2;Author\n';
    const { rows } = parseCsvText(csv);
    expect(rows).toHaveLength(2);
  });

  it('trims whitespace from values', () => {
    const csv = 'date;title;author\n 29.02.2024 ; Stand by Me ; Ben E. King ';
    const { rows } = parseCsvText(csv);
    expect(rows[0].date).toBe('29.02.2024');
    expect(rows[0].title).toBe('Stand by Me');
    expect(rows[0].author).toBe('Ben E. King');
  });

  it('returns error for missing header', () => {
    const csv = 'x;y;z\n29.02.2024;Song;Author';
    const { rows, errors } = parseCsvText(csv);
    expect(rows).toHaveLength(0);
    expect(errors).toHaveLength(1);
    expect(errors[0].message).toContain('date');
  });

  it('returns error for header-only CSV', () => {
    const csv = 'date;title;author';
    const { rows, errors } = parseCsvText(csv);
    expect(rows).toHaveLength(0);
    expect(errors).toHaveLength(1);
  });

  it('reports rows with missing title', () => {
    const csv = 'date;title;author\n29.02.2024;;Author';
    const { rows, errors } = parseCsvText(csv);
    expect(rows).toHaveLength(0);
    expect(errors).toHaveLength(1);
    expect(errors[0].message).toContain('title');
  });

  it('reports rows with missing date', () => {
    const csv = 'date;title;author\n;Song Title;Author';
    const { rows, errors } = parseCsvText(csv);
    expect(rows).toHaveLength(0);
    expect(errors).toHaveLength(1);
    expect(errors[0].message).toContain('date');
  });

  it('handles case-insensitive headers', () => {
    const csv = 'Date;Title;Author\n29.02.2024;Song;Artist';
    const { rows } = parseCsvText(csv);
    expect(rows).toHaveLength(1);
  });
});
