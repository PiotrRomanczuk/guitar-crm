import { type NoteName, TOTAL_FRETS } from '@/lib/music-theory';

export interface ScalePosition {
  index: number;
  anchorFret: number;
  fretRange: [number, number];
  cells: { stringIndex: number; fret: number }[];
  hasRoot: boolean;
}

/**
 * Compute scale positions (box patterns) from the active scale.
 * Each position is anchored by a unique scale degree on string 0 (low E).
 */
export function getScalePositions(
  rootNote: NoteName,
  scaleNotes: NoteName[],
  fretboard: NoteName[][],
): ScalePosition[] {
  if (scaleNotes.length === 0) return [];

  const anchors: number[] = [];
  const seen = new Set<NoteName>();

  for (let fret = 0; fret <= 11; fret++) {
    const note = fretboard[0][fret];
    if (scaleNotes.includes(note) && !seen.has(note)) {
      seen.add(note);
      anchors.push(fret);
    }
  }

  return anchors
    .sort((a, b) => a - b)
    .map((anchor, i) => {
      const minFret = Math.max(0, anchor - 1);
      const maxFret = Math.min(TOTAL_FRETS, anchor + 3);
      const fretRange: [number, number] = [minFret, maxFret];

      const cells: { stringIndex: number; fret: number }[] = [];
      let hasRoot = false;

      for (let s = 0; s < fretboard.length; s++) {
        for (let f = minFret; f <= maxFret; f++) {
          if (scaleNotes.includes(fretboard[s][f])) {
            cells.push({ stringIndex: s, fret: f });
          }
        }
      }

      for (let f = minFret; f <= maxFret; f++) {
        if (fretboard[0][f] === rootNote) {
          hasRoot = true;
          break;
        }
      }

      return { index: i + 1, anchorFret: anchor, fretRange, cells, hasRoot };
    });
}

/**
 * Build a set of cell keys for the selected position(s).
 * Returns null when no filtering should be applied.
 */
export function buildPositionCellSet(
  positions: ScalePosition[],
  selected: number | 'all' | 'none',
): Set<string> | null {
  if (selected === 'none') return null;

  const set = new Set<string>();

  if (selected === 'all') {
    for (const pos of positions) {
      for (const cell of pos.cells) {
        set.add(`${cell.stringIndex}-${cell.fret}`);
      }
    }
    return set;
  }

  const pos = positions.find((p) => p.index === selected);
  if (!pos) return null;

  for (const cell of pos.cells) {
    set.add(`${cell.stringIndex}-${cell.fret}`);
  }
  return set;
}
