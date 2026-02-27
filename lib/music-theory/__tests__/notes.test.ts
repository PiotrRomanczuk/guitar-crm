import {
  CHROMATIC_NOTES,
  STANDARD_TUNING,
  TOTAL_FRETS,
  ENHARMONIC_MAP,
  INTERVAL_NAMES,
  getNoteAtFret,
  buildFretboard,
  getNoteIndex,
  noteFromIndex,
  formatNote,
  getIntervalName,
  getSemitoneDistance,
  type NoteName,
} from '../notes';

describe('CHROMATIC_NOTES', () => {
  it('has exactly 12 notes', () => {
    expect(CHROMATIC_NOTES).toHaveLength(12);
  });

  it('starts with C and ends with B', () => {
    expect(CHROMATIC_NOTES[0]).toBe('C');
    expect(CHROMATIC_NOTES[11]).toBe('B');
  });

  it('contains all expected chromatic notes in order', () => {
    expect(CHROMATIC_NOTES).toEqual([
      'C', 'C#', 'D', 'D#', 'E', 'F',
      'F#', 'G', 'G#', 'A', 'A#', 'B',
    ]);
  });

  it('has no duplicate notes', () => {
    const unique = new Set(CHROMATIC_NOTES);
    expect(unique.size).toBe(CHROMATIC_NOTES.length);
  });
});

describe('STANDARD_TUNING', () => {
  it('has 6 strings', () => {
    expect(STANDARD_TUNING).toHaveLength(6);
  });

  it('is E-A-D-G-B-E from low to high', () => {
    expect(STANDARD_TUNING).toEqual(['E', 'A', 'D', 'G', 'B', 'E']);
  });
});

describe('TOTAL_FRETS', () => {
  it('is 15', () => {
    expect(TOTAL_FRETS).toBe(15);
  });
});

describe('ENHARMONIC_MAP', () => {
  it('maps all 5 sharps to flats', () => {
    expect(Object.keys(ENHARMONIC_MAP)).toHaveLength(5);
    expect(ENHARMONIC_MAP['C#']).toBe('Db');
    expect(ENHARMONIC_MAP['D#']).toBe('Eb');
    expect(ENHARMONIC_MAP['F#']).toBe('Gb');
    expect(ENHARMONIC_MAP['G#']).toBe('Ab');
    expect(ENHARMONIC_MAP['A#']).toBe('Bb');
  });

  it('does not contain natural notes', () => {
    const naturals = ['C', 'D', 'E', 'F', 'G', 'A', 'B'];
    for (const n of naturals) {
      expect(ENHARMONIC_MAP[n]).toBeUndefined();
    }
  });
});

describe('INTERVAL_NAMES', () => {
  it('has exactly 12 interval names', () => {
    expect(INTERVAL_NAMES).toHaveLength(12);
  });

  it('starts with R (root)', () => {
    expect(INTERVAL_NAMES[0]).toBe('R');
  });

  it('contains expected interval names in order', () => {
    expect(INTERVAL_NAMES).toEqual([
      'R', 'b2', '2', 'b3', '3', '4', 'b5', '5', 'b6', '6', 'b7', '7',
    ]);
  });
});

describe('getNoteAtFret', () => {
  it('returns the open string note at fret 0', () => {
    expect(getNoteAtFret('E', 0)).toBe('E');
  });

  it('returns correct note at fret 1', () => {
    expect(getNoteAtFret('E', 1)).toBe('F');
  });

  it('wraps around after 12 frets', () => {
    expect(getNoteAtFret('E', 12)).toBe('E');
  });

  it('handles all chromatic notes from C', () => {
    expect(getNoteAtFret('C', 7)).toBe('G');
  });

  it('returns F# at fret 2 on the low E string', () => {
    expect(getNoteAtFret('E', 2)).toBe('F#');
  });

  it('returns A at fret 5 on the low E string', () => {
    expect(getNoteAtFret('E', 5)).toBe('A');
  });

  it('returns correct note on the A string', () => {
    expect(getNoteAtFret('A', 3)).toBe('C');
  });

  it('returns correct note on the B string', () => {
    expect(getNoteAtFret('B', 1)).toBe('C');
  });

  it('handles frets beyond 12 (second octave)', () => {
    expect(getNoteAtFret('E', 13)).toBe('F');
    expect(getNoteAtFret('E', 15)).toBe('G');
  });

  it('returns open note for each standard tuning string', () => {
    const tuning: NoteName[] = ['E', 'A', 'D', 'G', 'B', 'E'];
    for (const note of tuning) {
      expect(getNoteAtFret(note, 0)).toBe(note);
    }
  });
});

describe('buildFretboard', () => {
  const fretboard = buildFretboard();

  it('returns 6 strings with default tuning', () => {
    expect(fretboard).toHaveLength(6);
  });

  it('each string has 16 positions (0 through 15)', () => {
    for (const string of fretboard) {
      expect(string).toHaveLength(16);
    }
  });

  it('first string open note is E (low E)', () => {
    expect(fretboard[0][0]).toBe('E');
  });

  it('last string open note is E (high e)', () => {
    expect(fretboard[5][0]).toBe('E');
  });

  it('second string open note is A', () => {
    expect(fretboard[1][0]).toBe('A');
  });

  it('all notes are valid NoteName values', () => {
    for (const string of fretboard) {
      for (const note of string) {
        expect(CHROMATIC_NOTES).toContain(note);
      }
    }
  });

  it('supports custom tuning', () => {
    const dropD = buildFretboard(['D', 'A', 'D', 'G', 'B', 'E'] as NoteName[]);
    expect(dropD[0][0]).toBe('D');
    expect(dropD[0][2]).toBe('E');
  });

  it('supports custom number of frets', () => {
    const shortFretboard = buildFretboard(STANDARD_TUNING, 5);
    for (const string of shortFretboard) {
      expect(string).toHaveLength(6); // frets 0 through 5
    }
  });

  it('notes at fret 12 match open notes (octave)', () => {
    for (let s = 0; s < 6; s++) {
      expect(fretboard[s][12]).toBe(fretboard[s][0]);
    }
  });

  it('produces correct sequence on low E string', () => {
    const lowE = fretboard[0];
    expect(lowE[0]).toBe('E');
    expect(lowE[1]).toBe('F');
    expect(lowE[2]).toBe('F#');
    expect(lowE[3]).toBe('G');
    expect(lowE[5]).toBe('A');
    expect(lowE[7]).toBe('B');
  });
});

describe('getNoteIndex', () => {
  it('returns 0 for C', () => {
    expect(getNoteIndex('C')).toBe(0);
  });

  it('returns 4 for E', () => {
    expect(getNoteIndex('E')).toBe(4);
  });

  it('returns 11 for B', () => {
    expect(getNoteIndex('B')).toBe(11);
  });

  it('returns correct index for all chromatic notes', () => {
    CHROMATIC_NOTES.forEach((note, index) => {
      expect(getNoteIndex(note)).toBe(index);
    });
  });

  it('returns 1 for C#', () => {
    expect(getNoteIndex('C#')).toBe(1);
  });

  it('returns 7 for G', () => {
    expect(getNoteIndex('G')).toBe(7);
  });
});

describe('noteFromIndex', () => {
  it('returns C for index 0', () => {
    expect(noteFromIndex(0)).toBe('C');
  });

  it('returns E for index 4', () => {
    expect(noteFromIndex(4)).toBe('E');
  });

  it('returns B for index 11', () => {
    expect(noteFromIndex(11)).toBe('B');
  });

  it('handles indices > 11 via modulo', () => {
    expect(noteFromIndex(12)).toBe('C');
    expect(noteFromIndex(13)).toBe('C#');
    expect(noteFromIndex(24)).toBe('C');
  });

  it('handles negative indices via modulo', () => {
    expect(noteFromIndex(-1)).toBe('B');
    expect(noteFromIndex(-12)).toBe('C');
    expect(noteFromIndex(-2)).toBe('A#');
  });

  it('roundtrips with getNoteIndex', () => {
    for (const note of CHROMATIC_NOTES) {
      const index = getNoteIndex(note);
      expect(noteFromIndex(index)).toBe(note);
    }
  });
});

describe('formatNote', () => {
  it('returns sharp notation by default', () => {
    expect(formatNote('C#')).toBe('C#');
  });

  it('returns flat notation when useFlats is true', () => {
    expect(formatNote('C#', true)).toBe('Db');
  });

  it('returns natural notes unchanged regardless of useFlats', () => {
    expect(formatNote('C', true)).toBe('C');
    expect(formatNote('E', true)).toBe('E');
    expect(formatNote('G', false)).toBe('G');
  });

  it('converts all sharps to flats when useFlats is true', () => {
    expect(formatNote('D#', true)).toBe('Eb');
    expect(formatNote('F#', true)).toBe('Gb');
    expect(formatNote('G#', true)).toBe('Ab');
    expect(formatNote('A#', true)).toBe('Bb');
  });

  it('returns sharps when useFlats is false', () => {
    expect(formatNote('C#', false)).toBe('C#');
    expect(formatNote('F#', false)).toBe('F#');
  });

  it('handles natural notes with default parameter', () => {
    expect(formatNote('A')).toBe('A');
    expect(formatNote('B')).toBe('B');
  });
});

describe('getSemitoneDistance', () => {
  it('returns 0 for same note', () => {
    expect(getSemitoneDistance('C', 'C')).toBe(0);
    expect(getSemitoneDistance('E', 'E')).toBe(0);
  });

  it('returns 7 for C to G (perfect 5th)', () => {
    expect(getSemitoneDistance('C', 'G')).toBe(7);
  });

  it('returns 4 for C to E (major 3rd)', () => {
    expect(getSemitoneDistance('C', 'E')).toBe(4);
  });

  it('handles wrapping (G to C = 5 semitones)', () => {
    expect(getSemitoneDistance('G', 'C')).toBe(5);
  });

  it('returns 1 for E to F (minor 2nd)', () => {
    expect(getSemitoneDistance('E', 'F')).toBe(1);
  });

  it('returns 2 for C to D (major 2nd)', () => {
    expect(getSemitoneDistance('C', 'D')).toBe(2);
  });

  it('returns 3 for A to C (minor 3rd)', () => {
    expect(getSemitoneDistance('A', 'C')).toBe(3);
  });

  it('is non-negative for all note pairs', () => {
    for (const root of CHROMATIC_NOTES) {
      for (const note of CHROMATIC_NOTES) {
        const distance = getSemitoneDistance(root, note);
        expect(distance).toBeGreaterThanOrEqual(0);
        expect(distance).toBeLessThanOrEqual(11);
      }
    }
  });
});

describe('getIntervalName', () => {
  it('returns R for 0 semitones', () => {
    expect(getIntervalName(0)).toBe('R');
  });

  it('returns b3 for 3 semitones', () => {
    expect(getIntervalName(3)).toBe('b3');
  });

  it('returns 3 for 4 semitones', () => {
    expect(getIntervalName(4)).toBe('3');
  });

  it('returns 5 for 7 semitones', () => {
    expect(getIntervalName(7)).toBe('5');
  });

  it('returns 7 for 11 semitones', () => {
    expect(getIntervalName(11)).toBe('7');
  });

  it('handles values beyond 11 via modulo', () => {
    expect(getIntervalName(12)).toBe('R');
    expect(getIntervalName(19)).toBe('5');
  });

  it('handles negative values via modulo', () => {
    expect(getIntervalName(-1)).toBe('7');
    expect(getIntervalName(-5)).toBe('5');
    expect(getIntervalName(-12)).toBe('R');
  });

  it('returns correct interval for all 12 semitones', () => {
    const expected = ['R', 'b2', '2', 'b3', '3', '4', 'b5', '5', 'b6', '6', 'b7', '7'];
    for (let i = 0; i < 12; i++) {
      expect(getIntervalName(i)).toBe(expected[i]);
    }
  });
});
