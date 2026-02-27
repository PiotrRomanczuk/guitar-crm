import {
  CHORD_DEFINITIONS,
  getChordNotes,
  isNoteInChord,
  getChordDisplayName,
} from '../chords';
import { CHROMATIC_NOTES, type NoteName } from '../notes';

describe('CHORD_DEFINITIONS', () => {
  const chordKeys = Object.keys(CHORD_DEFINITIONS);

  it('has at least 10 chord types', () => {
    expect(chordKeys.length).toBeGreaterThanOrEqual(10);
  });

  it('all chords have valid intervals starting with 0', () => {
    for (const key of chordKeys) {
      const chord = CHORD_DEFINITIONS[key];
      expect(chord.intervals[0]).toBe(0);
    }
  });

  it('all chords have name, suffix, and description', () => {
    for (const key of chordKeys) {
      const chord = CHORD_DEFINITIONS[key];
      expect(chord.name).toBeTruthy();
      expect(typeof chord.name).toBe('string');
      expect(typeof chord.suffix).toBe('string');
      expect(chord.description).toBeTruthy();
      expect(typeof chord.description).toBe('string');
    }
  });

  it('major suffix is empty string', () => {
    expect(CHORD_DEFINITIONS.major.suffix).toBe('');
  });

  it('minor suffix is m', () => {
    expect(CHORD_DEFINITIONS.minor.suffix).toBe('m');
  });

  it('intervals are in ascending order within each chord', () => {
    for (const key of chordKeys) {
      const chord = CHORD_DEFINITIONS[key];
      for (let i = 1; i < chord.intervals.length; i++) {
        expect(chord.intervals[i]).toBeGreaterThan(chord.intervals[i - 1]);
      }
    }
  });

  it('major triad has 3 intervals: [0, 4, 7]', () => {
    expect(CHORD_DEFINITIONS.major.intervals).toEqual([0, 4, 7]);
  });

  it('minor triad has 3 intervals: [0, 3, 7]', () => {
    expect(CHORD_DEFINITIONS.minor.intervals).toEqual([0, 3, 7]);
  });

  it('power chord has only 2 intervals: [0, 7]', () => {
    expect(CHORD_DEFINITIONS.power.intervals).toEqual([0, 7]);
  });

  it('dim7 has 4 intervals: [0, 3, 6, 9]', () => {
    expect(CHORD_DEFINITIONS.dim7.intervals).toEqual([0, 3, 6, 9]);
  });

  it('add9 has interval 14 (compound interval)', () => {
    expect(CHORD_DEFINITIONS.add9.intervals).toContain(14);
  });
});

describe('getChordNotes', () => {
  it('returns C major triad', () => {
    expect(getChordNotes('C', 'major')).toEqual(['C', 'E', 'G']);
  });

  it('returns A minor triad', () => {
    expect(getChordNotes('A', 'minor')).toEqual(['A', 'C', 'E']);
  });

  it('returns G7 chord', () => {
    expect(getChordNotes('G', 'dominant7')).toEqual(['G', 'B', 'D', 'F']);
  });

  it('returns empty for unknown chord key', () => {
    expect(getChordNotes('C', 'nonexistent_chord')).toEqual([]);
  });

  it('power chord has only 2 notes', () => {
    const notes = getChordNotes('E', 'power');
    expect(notes).toHaveLength(2);
    expect(notes).toEqual(['E', 'B']);
  });

  it('dim7 has 4 notes', () => {
    const notes = getChordNotes('B', 'dim7');
    expect(notes).toHaveLength(4);
  });

  it('add9 wraps interval 14 correctly', () => {
    // C add9: root=0, major 3rd=4, perfect 5th=7, 9th=14 -> 14%12=2 -> D
    const notes = getChordNotes('C', 'add9');
    expect(notes).toEqual(['C', 'E', 'G', 'D']);
  });

  it('returns D minor triad', () => {
    expect(getChordNotes('D', 'minor')).toEqual(['D', 'F', 'A']);
  });

  it('returns F# diminished', () => {
    expect(getChordNotes('F#', 'diminished')).toEqual(['F#', 'A', 'C']);
  });

  it('returns Cmaj7 chord', () => {
    expect(getChordNotes('C', 'major7')).toEqual(['C', 'E', 'G', 'B']);
  });

  it('returns Am7 chord', () => {
    expect(getChordNotes('A', 'minor7')).toEqual(['A', 'C', 'E', 'G']);
  });

  it('returns Csus2 chord', () => {
    expect(getChordNotes('C', 'sus2')).toEqual(['C', 'D', 'G']);
  });

  it('returns Csus4 chord', () => {
    expect(getChordNotes('C', 'sus4')).toEqual(['C', 'F', 'G']);
  });

  it('returns C augmented chord', () => {
    expect(getChordNotes('C', 'augmented')).toEqual(['C', 'E', 'G#']);
  });

  it('first note is always the root for valid chords', () => {
    for (const chordKey of Object.keys(CHORD_DEFINITIONS)) {
      for (const root of CHROMATIC_NOTES) {
        const notes = getChordNotes(root, chordKey);
        if (notes.length > 0) {
          expect(notes[0]).toBe(root);
        }
      }
    }
  });

  it('all returned notes are valid NoteName values', () => {
    for (const chordKey of Object.keys(CHORD_DEFINITIONS)) {
      for (const root of CHROMATIC_NOTES) {
        const notes = getChordNotes(root, chordKey);
        for (const note of notes) {
          expect(CHROMATIC_NOTES).toContain(note);
        }
      }
    }
  });
});

describe('isNoteInChord', () => {
  it('returns true for chord tones', () => {
    expect(isNoteInChord('C', 'C', 'major')).toBe(true);
    expect(isNoteInChord('E', 'C', 'major')).toBe(true);
    expect(isNoteInChord('G', 'C', 'major')).toBe(true);
  });

  it('returns false for non-chord tones', () => {
    expect(isNoteInChord('D', 'C', 'major')).toBe(false);
    expect(isNoteInChord('F', 'C', 'major')).toBe(false);
    expect(isNoteInChord('A', 'C', 'major')).toBe(false);
  });

  it('returns false for unknown chord', () => {
    expect(isNoteInChord('C', 'C', 'nonexistent')).toBe(false);
  });

  it('root is always in any valid chord', () => {
    for (const chordKey of Object.keys(CHORD_DEFINITIONS)) {
      for (const root of CHROMATIC_NOTES) {
        expect(isNoteInChord(root, root, chordKey)).toBe(true);
      }
    }
  });

  it('Am chord contains A, C, E only', () => {
    const inChord: NoteName[] = ['A', 'C', 'E'];
    const notInChord: NoteName[] = [
      'A#', 'B', 'C#', 'D', 'D#', 'F', 'F#', 'G', 'G#',
    ];
    for (const note of inChord) {
      expect(isNoteInChord(note, 'A', 'minor')).toBe(true);
    }
    for (const note of notInChord) {
      expect(isNoteInChord(note, 'A', 'minor')).toBe(false);
    }
  });
});

describe('getChordDisplayName', () => {
  it('formats major chord (no suffix)', () => {
    expect(getChordDisplayName('C', 'major')).toBe('C');
  });

  it('formats minor chord', () => {
    expect(getChordDisplayName('A', 'minor')).toBe('Am');
  });

  it('formats dominant 7th chord', () => {
    expect(getChordDisplayName('G', 'dominant7')).toBe('G7');
  });

  it('formats major 7th chord', () => {
    expect(getChordDisplayName('C', 'major7')).toBe('Cmaj7');
  });

  it('formats minor 7th chord', () => {
    expect(getChordDisplayName('D', 'minor7')).toBe('Dm7');
  });

  it('formats diminished chord', () => {
    expect(getChordDisplayName('F#', 'diminished')).toBe('F#dim');
  });

  it('formats augmented chord', () => {
    expect(getChordDisplayName('C', 'augmented')).toBe('Caug');
  });

  it('formats sus2 chord', () => {
    expect(getChordDisplayName('D', 'sus2')).toBe('Dsus2');
  });

  it('formats sus4 chord', () => {
    expect(getChordDisplayName('A', 'sus4')).toBe('Asus4');
  });

  it('formats power chord', () => {
    expect(getChordDisplayName('E', 'power')).toBe('E5');
  });

  it('formats dim7 chord', () => {
    expect(getChordDisplayName('B', 'dim7')).toBe('Bdim7');
  });

  it('formats add9 chord', () => {
    expect(getChordDisplayName('G', 'add9')).toBe('Gadd9');
  });

  it('returns just root for unknown chord', () => {
    expect(getChordDisplayName('C', 'nonexistent')).toBe('C');
  });

  it('works with all roots and chord types', () => {
    for (const chordKey of Object.keys(CHORD_DEFINITIONS)) {
      for (const root of CHROMATIC_NOTES) {
        const name = getChordDisplayName(root, chordKey);
        expect(name).toBeTruthy();
        expect(name.startsWith(root)).toBe(true);
      }
    }
  });
});
