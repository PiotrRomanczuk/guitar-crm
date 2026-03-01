/**
 * Chromatic scale utilities for music theory analysis.
 */

export const CHROMATIC_NOTES = [
  'C', 'C#', 'D', 'D#', 'E', 'F', 'F#', 'G', 'G#', 'A', 'A#', 'B',
] as const;

/** Map note names (including enharmonics) to semitone values 0-11. */
export const NOTE_TO_SEMITONE: Record<string, number> = {
  C: 0, 'C#': 1, Db: 1,
  D: 2, 'D#': 3, Eb: 3,
  E: 4, Fb: 4, 'E#': 5,
  F: 5, 'F#': 6, Gb: 6,
  G: 7, 'G#': 8, Ab: 8,
  A: 9, 'A#': 10, Bb: 10,
  B: 11, Cb: 11, 'B#': 0,
};

/** W-W-H-W-W-W-H */
export const MAJOR_SCALE_INTERVALS = [0, 2, 4, 5, 7, 9, 11] as const;

/** W-H-W-W-H-W-W (natural minor) */
export const MINOR_SCALE_INTERVALS = [0, 2, 3, 5, 7, 8, 10] as const;

/**
 * Returns the ascending semitone distance between two notes (0-11).
 */
export function semitoneDistance(from: string, to: string): number {
  const a = NOTE_TO_SEMITONE[from];
  const b = NOTE_TO_SEMITONE[to];
  if (a === undefined || b === undefined) return -1;
  return (b - a + 12) % 12;
}
