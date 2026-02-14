export const CHROMATIC_NOTES = [
  'C', 'C#', 'D', 'D#', 'E', 'F',
  'F#', 'G', 'G#', 'A', 'A#', 'B',
] as const;

export type NoteName = (typeof CHROMATIC_NOTES)[number];

// Enharmonic display alternatives (flats)
export const ENHARMONIC_MAP: Record<string, string> = {
  'C#': 'Db', 'D#': 'Eb', 'F#': 'Gb', 'G#': 'Ab', 'A#': 'Bb',
};

// Standard tuning: string 6 (low E) to string 1 (high E)
export const STANDARD_TUNING: NoteName[] = ['E', 'A', 'D', 'G', 'B', 'E'];

export const TOTAL_FRETS = 15;

/**
 * Get the note at a specific fret given an open string note.
 */
export function getNoteAtFret(openNote: NoteName, fret: number): NoteName {
  const startIndex = CHROMATIC_NOTES.indexOf(openNote);
  const noteIndex = (startIndex + fret) % 12;
  return CHROMATIC_NOTES[noteIndex];
}

/**
 * Build the full fretboard: 6 strings x (0..15) frets.
 * Returns a 2D array [stringIndex][fret] = NoteName.
 * String 0 = low E (6th string), String 5 = high E (1st string).
 */
export function buildFretboard(
  tuning: NoteName[] = STANDARD_TUNING,
  totalFrets: number = TOTAL_FRETS,
): NoteName[][] {
  return tuning.map((openNote) => {
    const frets: NoteName[] = [];
    for (let fret = 0; fret <= totalFrets; fret++) {
      frets.push(getNoteAtFret(openNote, fret));
    }
    return frets;
  });
}

/**
 * Get the note index in the chromatic scale (0-11).
 */
export function getNoteIndex(note: NoteName): number {
  return CHROMATIC_NOTES.indexOf(note);
}

/**
 * Get a note name from its chromatic index.
 */
export function noteFromIndex(index: number): NoteName {
  return CHROMATIC_NOTES[((index % 12) + 12) % 12];
}

/**
 * Format a note for display, optionally showing flats.
 */
export function formatNote(note: NoteName, useFlats: boolean = false): string {
  if (useFlats && ENHARMONIC_MAP[note]) {
    return ENHARMONIC_MAP[note];
  }
  return note;
}
