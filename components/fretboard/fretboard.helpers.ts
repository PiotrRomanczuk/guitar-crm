import {
  type NoteName,
  formatNote,
  getSemitoneDistance,
  getIntervalName,
} from '@/lib/music-theory';

/** Fret markers (single dots and double dot at 12th) */
export const FRET_MARKERS: Record<number, 'single' | 'double'> = {
  3: 'single',
  5: 'single',
  7: 'single',
  9: 'single',
  12: 'double',
  15: 'single',
};

/** String labels for standard tuning (thickest to thinnest) */
export const STRING_LABELS = ['6th (E)', '5th (A)', '4th (D)', '3rd (G)', '2nd (B)', '1st (e)'];

/** Color classes for scale degrees (reduced brightness) */
const DEGREE_COLORS: Record<number, string> = {
  0: 'bg-red-600 dark:bg-red-700 text-white',      // Root
  1: 'bg-orange-600 dark:bg-orange-700 text-white', // 2nd
  2: 'bg-yellow-600 dark:bg-yellow-700 text-white', // 3rd
  3: 'bg-green-600 dark:bg-green-700 text-white',   // 4th
  4: 'bg-cyan-600 dark:bg-cyan-700 text-white',     // 5th
  5: 'bg-blue-600 dark:bg-blue-700 text-white',     // 6th
  6: 'bg-purple-600 dark:bg-purple-700 text-white',  // 7th
};

/** Fallback color for notes not mapped to a degree */
const DEFAULT_NOTE_COLOR = 'bg-muted-foreground/30 text-muted-foreground';

/**
 * Get the CSS class for a highlighted note.
 */
export function getNoteColor(
  note: NoteName,
  highlightedNotes: NoteName[],
  rootNote?: NoteName,
  showFunctionalColors: boolean = true,
): string {
  const index = highlightedNotes.indexOf(note);
  if (index === -1) return DEFAULT_NOTE_COLOR;

  if (showFunctionalColors && rootNote) {
    const semitones = getSemitoneDistance(rootNote, note);
    switch (semitones) {
      case 0: // Root
        return 'bg-red-600 dark:bg-red-700 text-white';
      case 3:
      case 4: // 3rd
        return 'bg-blue-600 dark:bg-blue-700 text-white';
      case 6:
      case 7: // 5th
        return 'bg-green-600 dark:bg-green-700 text-white';
      case 10:
      case 11: // 7th
        return 'bg-amber-600 dark:bg-amber-700 text-white';
      default:
        return 'bg-slate-600 dark:bg-slate-700 text-white';
    }
  }

  return 'bg-primary dark:bg-primary/80 text-primary-foreground';
}

/**
 * Get the interval name for a note relative to a root.
 */
export function getNoteInterval(note: NoteName, rootNote: NoteName): string {
  const semitones = getSemitoneDistance(rootNote, note);
  return getIntervalName(semitones);
}

/**
 * Format note text for display on the fretboard.
 */
export function formatNoteDisplay(
  note: NoteName,
  useFlats: boolean,
): string {
  return formatNote(note, useFlats);
}

/**
 * Check if a note should be visually emphasized (is in the highlighted set).
 */
export function isHighlighted(
  note: NoteName,
  highlightedNotes: NoteName[],
): boolean {
  return highlightedNotes.includes(note);
}

/**
 * Check if a note is the root note.
 */
export function isRoot(
  note: NoteName,
  highlightedNotes: NoteName[],
): boolean {
  return highlightedNotes.length > 0 && highlightedNotes[0] === note;
}
