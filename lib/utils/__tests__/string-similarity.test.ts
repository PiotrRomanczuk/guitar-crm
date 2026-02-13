import { calculateSimilarity } from '../string-similarity';

describe('calculateSimilarity', () => {
  it('returns 100 for exact matches', () => {
    expect(calculateSimilarity('Queen', 'Queen')).toBe(100);
  });

  it('returns 100 for case-insensitive matches', () => {
    expect(calculateSimilarity('queen', 'QUEEN')).toBe(100);
  });

  it('returns 100 when only punctuation differs', () => {
    expect(calculateSimilarity('Ben E. King', 'Ben E King')).toBe(100);
  });

  it('returns high score for close matches (typo)', () => {
    const score = calculateSimilarity('Led Zepplin', 'Led Zeppelin');
    expect(score).toBeGreaterThanOrEqual(80);
  });

  it('returns low score for unrelated strings', () => {
    const score = calculateSimilarity('Queen', 'Metallica');
    expect(score).toBeLessThan(50);
  });

  it('handles empty strings', () => {
    expect(calculateSimilarity('', '')).toBe(100);
    expect(calculateSimilarity('Queen', '')).toBe(0);
    expect(calculateSimilarity('', 'Queen')).toBe(0);
  });

  it('ignores leading/trailing whitespace', () => {
    expect(calculateSimilarity('  Queen  ', 'Queen')).toBe(100);
  });

  it('handles accented/special characters by stripping them', () => {
    const score = calculateSimilarity('Beyoncé', 'Beyonce');
    expect(score).toBeGreaterThanOrEqual(80);
  });
});
