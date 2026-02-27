import {
  CAGED_PATTERNS,
  getActiveCAGEDShapes,
  type CAGEDShape,
} from './caged.helpers';
import { buildFretboard, type NoteName } from '@/lib/music-theory';

describe('CAGED_PATTERNS', () => {
  it('has exactly 5 patterns (C, A, G, E, D)', () => {
    expect(CAGED_PATTERNS).toHaveLength(5);
  });

  it('pattern names are C, A, G, E, D', () => {
    const names = CAGED_PATTERNS.map((p) => p.name);
    expect(names).toEqual(['C', 'A', 'G', 'E', 'D']);
  });

  it('each pattern has valid stringIndex offsets (0-5)', () => {
    for (const pattern of CAGED_PATTERNS) {
      for (const offset of pattern.offsets) {
        expect(offset.stringIndex).toBeGreaterThanOrEqual(0);
        expect(offset.stringIndex).toBeLessThanOrEqual(5);
      }
    }
  });

  it('each pattern has a rootStringIndex within 0-5', () => {
    for (const pattern of CAGED_PATTERNS) {
      expect(pattern.rootStringIndex).toBeGreaterThanOrEqual(0);
      expect(pattern.rootStringIndex).toBeLessThanOrEqual(5);
    }
  });

  it('each pattern has at least 2 offsets', () => {
    for (const pattern of CAGED_PATTERNS) {
      expect(pattern.offsets.length).toBeGreaterThanOrEqual(2);
    }
  });

  it('each pattern root string is referenced in offsets', () => {
    for (const pattern of CAGED_PATTERNS) {
      const offsetStrings = pattern.offsets.map((o) => o.stringIndex);
      expect(offsetStrings).toContain(pattern.rootStringIndex);
    }
  });

  it('E pattern has 6 offsets (all strings)', () => {
    const ePattern = CAGED_PATTERNS.find((p) => p.name === 'E');
    expect(ePattern?.offsets).toHaveLength(6);
  });

  it('D pattern has 4 offsets (upper strings only)', () => {
    const dPattern = CAGED_PATTERNS.find((p) => p.name === 'D');
    expect(dPattern?.offsets).toHaveLength(4);
  });

  it('C and A patterns have root on string 1 (index 1 = A string)', () => {
    const cPattern = CAGED_PATTERNS.find((p) => p.name === 'C');
    const aPattern = CAGED_PATTERNS.find((p) => p.name === 'A');
    expect(cPattern?.rootStringIndex).toBe(1);
    expect(aPattern?.rootStringIndex).toBe(1);
  });

  it('G and E patterns have root on string 0 (index 0 = low E string)', () => {
    const gPattern = CAGED_PATTERNS.find((p) => p.name === 'G');
    const ePattern = CAGED_PATTERNS.find((p) => p.name === 'E');
    expect(gPattern?.rootStringIndex).toBe(0);
    expect(ePattern?.rootStringIndex).toBe(0);
  });

  it('D pattern has root on string 2 (index 2 = D string)', () => {
    const dPattern = CAGED_PATTERNS.find((p) => p.name === 'D');
    expect(dPattern?.rootStringIndex).toBe(2);
  });
});

describe('getActiveCAGEDShapes', () => {
  const fretboard = buildFretboard();

  it('returns shapes for C root', () => {
    const shapes = getActiveCAGEDShapes('C', fretboard);
    expect(shapes.length).toBeGreaterThan(0);
    expect(shapes.some((s) => s.name === 'C')).toBe(true);
  });

  it('returns shapes for E root', () => {
    const shapes = getActiveCAGEDShapes('E', fretboard);
    expect(shapes.length).toBeGreaterThan(0);
  });

  it('returns shapes for A root', () => {
    const shapes = getActiveCAGEDShapes('A', fretboard);
    expect(shapes.length).toBeGreaterThan(0);
  });

  it('returns shapes for G root', () => {
    const shapes = getActiveCAGEDShapes('G', fretboard);
    expect(shapes.length).toBeGreaterThan(0);
    expect(shapes.some((s) => s.name === 'G')).toBe(true);
  });

  it('returns shapes for D root', () => {
    const shapes = getActiveCAGEDShapes('D', fretboard);
    expect(shapes.length).toBeGreaterThan(0);
    expect(shapes.some((s) => s.name === 'D')).toBe(true);
  });

  it('all cells are within fretboard bounds', () => {
    for (const root of ['C', 'D', 'E', 'F', 'G', 'A', 'B'] as NoteName[]) {
      const shapes = getActiveCAGEDShapes(root, fretboard);
      for (const shape of shapes) {
        for (const cell of shape.cells) {
          expect(cell.fret).toBeGreaterThanOrEqual(0);
          expect(cell.fret).toBeLessThanOrEqual(15);
          expect(cell.stringIndex).toBeGreaterThanOrEqual(0);
          expect(cell.stringIndex).toBeLessThanOrEqual(5);
        }
      }
    }
  });

  it('excludes shapes that would have negative frets', () => {
    for (const root of ['C', 'D', 'E', 'F', 'G', 'A', 'B'] as NoteName[]) {
      const shapes = getActiveCAGEDShapes(root, fretboard);
      for (const shape of shapes) {
        for (const cell of shape.cells) {
          expect(cell.fret).toBeGreaterThanOrEqual(0);
        }
      }
    }
  });

  it('excludes shapes that extend past fret 15', () => {
    for (const root of ['C', 'D', 'E', 'F', 'G', 'A', 'B'] as NoteName[]) {
      const shapes = getActiveCAGEDShapes(root, fretboard);
      for (const shape of shapes) {
        for (const cell of shape.cells) {
          expect(cell.fret).toBeLessThanOrEqual(15);
        }
      }
    }
  });

  it('shape names are valid CAGED letters', () => {
    const validNames: CAGEDShape[] = ['C', 'A', 'G', 'E', 'D'];
    for (const root of CHROMATIC_NOTES_LIST) {
      const shapes = getActiveCAGEDShapes(root, fretboard);
      for (const shape of shapes) {
        expect(validNames).toContain(shape.name);
      }
    }
  });

  it('E shape for E root is at fret 0', () => {
    const shapes = getActiveCAGEDShapes('E', fretboard);
    const eShape = shapes.find((s) => s.name === 'E' && s.rootFret === 0);
    expect(eShape).toBeDefined();
  });

  it('A shape for A root is at fret 0', () => {
    const shapes = getActiveCAGEDShapes('A', fretboard);
    const aShape = shapes.find((s) => s.name === 'A' && s.rootFret === 0);
    expect(aShape).toBeDefined();
  });

  it('D shape for D root is at fret 0', () => {
    const shapes = getActiveCAGEDShapes('D', fretboard);
    const dShape = shapes.find((s) => s.name === 'D' && s.rootFret === 0);
    expect(dShape).toBeDefined();
  });

  it('G shape for G root has rootFret at 3 on low E string', () => {
    // G is at fret 3 on the low E string
    const shapes = getActiveCAGEDShapes('G', fretboard);
    const gShape = shapes.find((s) => s.name === 'G' && s.rootFret === 3);
    expect(gShape).toBeDefined();
  });

  it('C shape for C root has rootFret at 3 on A string', () => {
    // C is at fret 3 on the A string (string index 1)
    const shapes = getActiveCAGEDShapes('C', fretboard);
    const cShape = shapes.find((s) => s.name === 'C' && s.rootFret === 3);
    expect(cShape).toBeDefined();
  });

  it('rootFret matches the fret where root note appears on root string', () => {
    const shapes = getActiveCAGEDShapes('C', fretboard);
    for (const shape of shapes) {
      const rootString = shape.rootStringIndex;
      const rootFret = shape.rootFret;
      expect(fretboard[rootString][rootFret]).toBe('C');
    }
  });

  it('returns multiple shapes for most roots', () => {
    // Most notes should have multiple CAGED shapes that fit on the fretboard
    for (const root of ['C', 'D', 'E', 'G', 'A'] as NoteName[]) {
      const shapes = getActiveCAGEDShapes(root, fretboard);
      expect(shapes.length).toBeGreaterThanOrEqual(2);
    }
  });

  it('number of cells per shape matches the pattern offsets', () => {
    const shapes = getActiveCAGEDShapes('C', fretboard);
    for (const shape of shapes) {
      const pattern = CAGED_PATTERNS.find((p) => p.name === shape.name);
      expect(pattern).toBeDefined();
      expect(shape.cells).toHaveLength(pattern!.offsets.length);
    }
  });

  it('all 12 chromatic root notes produce at least one shape', () => {
    for (const root of CHROMATIC_NOTES_LIST) {
      const shapes = getActiveCAGEDShapes(root, fretboard);
      expect(shapes.length).toBeGreaterThan(0);
    }
  });
});

// Helper constant for iteration
const CHROMATIC_NOTES_LIST: NoteName[] = [
  'C', 'C#', 'D', 'D#', 'E', 'F',
  'F#', 'G', 'G#', 'A', 'A#', 'B',
];
