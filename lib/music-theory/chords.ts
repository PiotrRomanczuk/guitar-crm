import { type NoteName, CHROMATIC_NOTES, getNoteIndex } from './notes';

export interface ChordDefinition {
  name: string;
  suffix: string;
  intervals: number[];
  description: string;
}

export const CHORD_DEFINITIONS: Record<string, ChordDefinition> = {
  major: {
    name: 'Major',
    suffix: '',
    intervals: [0, 4, 7],
    description: 'Root, major 3rd, perfect 5th.',
  },
  minor: {
    name: 'Minor',
    suffix: 'm',
    intervals: [0, 3, 7],
    description: 'Root, minor 3rd, perfect 5th.',
  },
  dominant7: {
    name: 'Dominant 7th',
    suffix: '7',
    intervals: [0, 4, 7, 10],
    description: 'Major triad + minor 7th. Blues, rock.',
  },
  major7: {
    name: 'Major 7th',
    suffix: 'maj7',
    intervals: [0, 4, 7, 11],
    description: 'Major triad + major 7th. Jazz, bossa nova.',
  },
  minor7: {
    name: 'Minor 7th',
    suffix: 'm7',
    intervals: [0, 3, 7, 10],
    description: 'Minor triad + minor 7th. Jazz, soul.',
  },
  sus2: {
    name: 'Suspended 2nd',
    suffix: 'sus2',
    intervals: [0, 2, 7],
    description: 'Root, major 2nd, perfect 5th. Open, ambiguous.',
  },
  sus4: {
    name: 'Suspended 4th',
    suffix: 'sus4',
    intervals: [0, 5, 7],
    description: 'Root, perfect 4th, perfect 5th. Creates tension.',
  },
  diminished: {
    name: 'Diminished',
    suffix: 'dim',
    intervals: [0, 3, 6],
    description: 'Root, minor 3rd, diminished 5th. Tense, unstable.',
  },
  augmented: {
    name: 'Augmented',
    suffix: 'aug',
    intervals: [0, 4, 8],
    description: 'Root, major 3rd, augmented 5th. Mysterious.',
  },
  power: {
    name: 'Power Chord',
    suffix: '5',
    intervals: [0, 7],
    description: 'Root and 5th only. Rock, punk, metal.',
  },
  dim7: {
    name: 'Diminished 7th',
    suffix: 'dim7',
    intervals: [0, 3, 6, 9],
    description: 'Stacked minor 3rds. Symmetric, transitional.',
  },
  add9: {
    name: 'Add 9',
    suffix: 'add9',
    intervals: [0, 4, 7, 14],
    description: 'Major triad + 9th (no 7th). Pop, acoustic.',
  },
};

/**
 * Get the notes of a chord given a root note and chord type.
 */
export function getChordNotes(root: NoteName, chordKey: string): NoteName[] {
  const chord = CHORD_DEFINITIONS[chordKey];
  if (!chord) return [];
  const rootIndex = getNoteIndex(root);
  return chord.intervals.map((interval) => {
    const noteIndex = (rootIndex + interval) % 12;
    return CHROMATIC_NOTES[noteIndex];
  });
}

/**
 * Check if a note belongs to a chord.
 */
export function isNoteInChord(
  note: NoteName,
  root: NoteName,
  chordKey: string,
): boolean {
  const chordNotes = getChordNotes(root, chordKey);
  return chordNotes.includes(note);
}

/**
 * Get display name for a chord (e.g., "Am7", "G", "F#dim").
 */
export function getChordDisplayName(root: NoteName, chordKey: string): string {
  const chord = CHORD_DEFINITIONS[chordKey];
  if (!chord) return root;
  return `${root}${chord.suffix}`;
}
