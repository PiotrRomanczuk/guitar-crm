import { buildFretboard, getScaleNotes, TOTAL_FRETS } from '@/lib/music-theory';
import { getScalePositions, buildPositionCellSet } from './positions.helpers';

const fretboard = buildFretboard();

describe('getScalePositions', () => {
  it('returns 5 positions for A minor pentatonic', () => {
    const notes = getScaleNotes('A', 'pentatonic_minor');
    const positions = getScalePositions('A', notes, fretboard);
    expect(positions).toHaveLength(5);
  });

  it('returns 7 positions for C major', () => {
    const notes = getScaleNotes('C', 'major');
    const positions = getScalePositions('C', notes, fretboard);
    expect(positions).toHaveLength(7);
  });

  it('returns 6 positions for A blues', () => {
    const notes = getScaleNotes('A', 'blues');
    const positions = getScalePositions('A', notes, fretboard);
    expect(positions).toHaveLength(6);
  });

  it('returns empty array for empty scale notes', () => {
    expect(getScalePositions('C', [], fretboard)).toEqual([]);
  });

  it('sorts positions by ascending anchor fret', () => {
    const notes = getScaleNotes('A', 'pentatonic_minor');
    const positions = getScalePositions('A', notes, fretboard);
    for (let i = 1; i < positions.length; i++) {
      expect(positions[i].anchorFret).toBeGreaterThan(positions[i - 1].anchorFret);
    }
  });

  it('uses 1-based index labels', () => {
    const notes = getScaleNotes('C', 'major');
    const positions = getScalePositions('C', notes, fretboard);
    positions.forEach((pos, i) => {
      expect(pos.index).toBe(i + 1);
    });
  });

  it('keeps all cells within fretboard bounds', () => {
    const notes = getScaleNotes('A', 'pentatonic_minor');
    const positions = getScalePositions('A', notes, fretboard);
    for (const pos of positions) {
      for (const cell of pos.cells) {
        expect(cell.stringIndex).toBeGreaterThanOrEqual(0);
        expect(cell.stringIndex).toBeLessThan(6);
        expect(cell.fret).toBeGreaterThanOrEqual(0);
        expect(cell.fret).toBeLessThanOrEqual(TOTAL_FRETS);
      }
    }
  });

  it('only includes scale notes in cells', () => {
    const notes = getScaleNotes('A', 'pentatonic_minor');
    const positions = getScalePositions('A', notes, fretboard);
    for (const pos of positions) {
      for (const cell of pos.cells) {
        expect(notes).toContain(fretboard[cell.stringIndex][cell.fret]);
      }
    }
  });

  it('correctly detects root positions', () => {
    const notes = getScaleNotes('A', 'pentatonic_minor');
    const positions = getScalePositions('A', notes, fretboard);
    const rootPositions = positions.filter((p) => p.hasRoot);
    expect(rootPositions.length).toBeGreaterThan(0);

    for (const pos of rootPositions) {
      expect(pos.fretRange[0]).toBeLessThanOrEqual(5);
      expect(pos.fretRange[1]).toBeGreaterThanOrEqual(5);
    }
  });

  it('fret ranges are clamped to valid bounds', () => {
    const notes = getScaleNotes('E', 'pentatonic_minor');
    const positions = getScalePositions('E', notes, fretboard);
    for (const pos of positions) {
      expect(pos.fretRange[0]).toBeGreaterThanOrEqual(0);
      expect(pos.fretRange[1]).toBeLessThanOrEqual(TOTAL_FRETS);
    }
  });
});

describe('buildPositionCellSet', () => {
  const notes = getScaleNotes('A', 'pentatonic_minor');
  const positions = getScalePositions('A', notes, fretboard);

  it('returns null for "none"', () => {
    expect(buildPositionCellSet(positions, 'none')).toBeNull();
  });

  it('returns a Set for a specific position', () => {
    const set = buildPositionCellSet(positions, 1);
    expect(set).toBeInstanceOf(Set);
    expect(set!.size).toBeGreaterThan(0);
  });

  it('returns union of all cells for "all"', () => {
    const allSet = buildPositionCellSet(positions, 'all');
    expect(allSet).toBeInstanceOf(Set);

    for (const pos of positions) {
      for (const cell of pos.cells) {
        expect(allSet!.has(`${cell.stringIndex}-${cell.fret}`)).toBe(true);
      }
    }
  });

  it('encodes keys as "stringIndex-fret"', () => {
    const set = buildPositionCellSet(positions, 1);
    for (const key of set!) {
      expect(key).toMatch(/^\d+-\d+$/);
    }
  });

  it('returns null for invalid position index', () => {
    expect(buildPositionCellSet(positions, 99)).toBeNull();
  });

  it('only contains cells from the selected position', () => {
    const set = buildPositionCellSet(positions, 2)!;
    const pos2 = positions.find((p) => p.index === 2)!;
    expect(set.size).toBe(pos2.cells.length);
    for (const cell of pos2.cells) {
      expect(set.has(`${cell.stringIndex}-${cell.fret}`)).toBe(true);
    }
  });
});
