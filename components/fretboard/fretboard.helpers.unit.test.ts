import {
  getNoteColor,
  getNoteInterval,
  formatNoteDisplay,
  isHighlighted,
  isRoot,
  FRET_MARKERS,
  STRING_LABELS,
} from './fretboard.helpers';
import type { NoteName } from '@/lib/music-theory';

describe('FRET_MARKERS', () => {
  it('has markers at frets 3, 5, 7, 9, 12, 15', () => {
    expect(FRET_MARKERS[3]).toBe('single');
    expect(FRET_MARKERS[5]).toBe('single');
    expect(FRET_MARKERS[7]).toBe('single');
    expect(FRET_MARKERS[9]).toBe('single');
    expect(FRET_MARKERS[12]).toBe('double');
    expect(FRET_MARKERS[15]).toBe('single');
  });

  it('does not have markers at frets without dots', () => {
    expect(FRET_MARKERS[1]).toBeUndefined();
    expect(FRET_MARKERS[2]).toBeUndefined();
    expect(FRET_MARKERS[4]).toBeUndefined();
    expect(FRET_MARKERS[6]).toBeUndefined();
    expect(FRET_MARKERS[8]).toBeUndefined();
    expect(FRET_MARKERS[10]).toBeUndefined();
    expect(FRET_MARKERS[11]).toBeUndefined();
    expect(FRET_MARKERS[13]).toBeUndefined();
    expect(FRET_MARKERS[14]).toBeUndefined();
  });

  it('only fret 12 has double marker', () => {
    for (const [fret, marker] of Object.entries(FRET_MARKERS)) {
      if (Number(fret) === 12) {
        expect(marker).toBe('double');
      } else {
        expect(marker).toBe('single');
      }
    }
  });
});

describe('STRING_LABELS', () => {
  it('has 6 labels', () => {
    expect(STRING_LABELS).toHaveLength(6);
  });

  it('starts with 6th (E) and ends with 1st (e)', () => {
    expect(STRING_LABELS[0]).toContain('6th');
    expect(STRING_LABELS[5]).toContain('1st');
  });
});

describe('getNoteColor', () => {
  const highlightedNotes: NoteName[] = ['C', 'E', 'G'];

  it('returns default color for non-highlighted notes', () => {
    const color = getNoteColor('D', highlightedNotes, 'C', true);
    expect(color).toContain('muted');
  });

  it('returns red for root when functional colors enabled', () => {
    const color = getNoteColor('C', highlightedNotes, 'C', true);
    expect(color).toContain('red');
  });

  it('returns blue for 3rd (4 semitones from root)', () => {
    // C to E = 4 semitones (major 3rd)
    const color = getNoteColor('E', highlightedNotes, 'C', true);
    expect(color).toContain('blue');
  });

  it('returns blue for minor 3rd (3 semitones from root)', () => {
    const minorNotes: NoteName[] = ['A', 'C', 'E'];
    // A to C = 3 semitones (minor 3rd)
    const color = getNoteColor('C', minorNotes, 'A', true);
    expect(color).toContain('blue');
  });

  it('returns green for 5th (7 semitones from root)', () => {
    // C to G = 7 semitones (perfect 5th)
    const color = getNoteColor('G', highlightedNotes, 'C', true);
    expect(color).toContain('green');
  });

  it('returns green for tritone/b5 (6 semitones from root)', () => {
    const dimNotes: NoteName[] = ['C', 'D#', 'F#'];
    // C to F# = 6 semitones
    const color = getNoteColor('F#', dimNotes, 'C', true);
    expect(color).toContain('green');
  });

  it('returns amber for 7th (11 semitones from root)', () => {
    const maj7Notes: NoteName[] = ['C', 'E', 'G', 'B'];
    // C to B = 11 semitones (major 7th)
    const color = getNoteColor('B', maj7Notes, 'C', true);
    expect(color).toContain('amber');
  });

  it('returns amber for b7 (10 semitones from root)', () => {
    const dom7Notes: NoteName[] = ['C', 'E', 'G', 'A#'];
    // C to A# = 10 semitones (minor 7th)
    const color = getNoteColor('A#', dom7Notes, 'C', true);
    expect(color).toContain('amber');
  });

  it('returns slate for other intervals (e.g. 2nd)', () => {
    const scaleNotes: NoteName[] = ['C', 'D', 'E', 'F', 'G', 'A', 'B'];
    // C to D = 2 semitones (major 2nd) -> falls into default case
    const color = getNoteColor('D', scaleNotes, 'C', true);
    expect(color).toContain('slate');
  });

  it('returns primary color when functional colors disabled', () => {
    const color = getNoteColor('C', highlightedNotes, 'C', false);
    expect(color).toContain('primary');
  });

  it('returns primary color when rootNote is undefined', () => {
    const color = getNoteColor('C', highlightedNotes, undefined, true);
    expect(color).toContain('primary');
  });

  it('handles empty highlighted notes', () => {
    const color = getNoteColor('C', [], 'C', true);
    expect(color).toContain('muted');
  });
});

describe('getNoteInterval', () => {
  it('returns R for root', () => {
    expect(getNoteInterval('C', 'C')).toBe('R');
  });

  it('returns correct interval for major 3rd', () => {
    // C to E = 4 semitones = major 3rd
    expect(getNoteInterval('E', 'C')).toBe('3');
  });

  it('returns correct interval for perfect 5th', () => {
    // C to G = 7 semitones
    expect(getNoteInterval('G', 'C')).toBe('5');
  });

  it('returns correct interval for minor 3rd', () => {
    // C to D# = 3 semitones
    expect(getNoteInterval('D#', 'C')).toBe('b3');
  });

  it('returns correct interval for minor 7th', () => {
    // C to A# = 10 semitones
    expect(getNoteInterval('A#', 'C')).toBe('b7');
  });

  it('returns correct interval for major 7th', () => {
    // C to B = 11 semitones
    expect(getNoteInterval('B', 'C')).toBe('7');
  });

  it('returns correct interval for perfect 4th', () => {
    // C to F = 5 semitones
    expect(getNoteInterval('F', 'C')).toBe('4');
  });

  it('returns correct interval for tritone', () => {
    // C to F# = 6 semitones
    expect(getNoteInterval('F#', 'C')).toBe('b5');
  });

  it('handles all 12 intervals from C', () => {
    const expected = ['R', 'b2', '2', 'b3', '3', '4', 'b5', '5', 'b6', '6', 'b7', '7'];
    const notes: NoteName[] = ['C', 'C#', 'D', 'D#', 'E', 'F', 'F#', 'G', 'G#', 'A', 'A#', 'B'];
    notes.forEach((note, idx) => {
      expect(getNoteInterval(note, 'C')).toBe(expected[idx]);
    });
  });
});

describe('formatNoteDisplay', () => {
  it('delegates to formatNote for sharp notation', () => {
    expect(formatNoteDisplay('C#', false)).toBe('C#');
  });

  it('delegates to formatNote for flat notation', () => {
    expect(formatNoteDisplay('C#', true)).toBe('Db');
  });

  it('returns natural notes unchanged', () => {
    expect(formatNoteDisplay('C', false)).toBe('C');
    expect(formatNoteDisplay('C', true)).toBe('C');
  });

  it('converts all sharps to flats when useFlats is true', () => {
    expect(formatNoteDisplay('D#', true)).toBe('Eb');
    expect(formatNoteDisplay('F#', true)).toBe('Gb');
    expect(formatNoteDisplay('G#', true)).toBe('Ab');
    expect(formatNoteDisplay('A#', true)).toBe('Bb');
  });
});

describe('isHighlighted', () => {
  it('returns true for notes in the highlighted set', () => {
    const notes: NoteName[] = ['C', 'E', 'G'];
    expect(isHighlighted('C', notes)).toBe(true);
    expect(isHighlighted('E', notes)).toBe(true);
    expect(isHighlighted('G', notes)).toBe(true);
  });

  it('returns false for notes not in the set', () => {
    const notes: NoteName[] = ['C', 'E', 'G'];
    expect(isHighlighted('D', notes)).toBe(false);
    expect(isHighlighted('F', notes)).toBe(false);
  });

  it('handles empty highlighted set', () => {
    expect(isHighlighted('C', [])).toBe(false);
  });

  it('handles single note in set', () => {
    const notes: NoteName[] = ['A'];
    expect(isHighlighted('A', notes)).toBe(true);
    expect(isHighlighted('B', notes)).toBe(false);
  });
});

describe('isRoot', () => {
  it('returns true when note matches first in highlighted notes', () => {
    const notes: NoteName[] = ['C', 'E', 'G'];
    expect(isRoot('C', notes)).toBe(true);
  });

  it('returns false when note does not match root', () => {
    const notes: NoteName[] = ['C', 'E', 'G'];
    expect(isRoot('E', notes)).toBe(false);
    expect(isRoot('G', notes)).toBe(false);
  });

  it('returns false for empty highlighted notes', () => {
    expect(isRoot('C', [])).toBe(false);
  });

  it('returns false for notes not in the set at all', () => {
    const notes: NoteName[] = ['A', 'C', 'E'];
    expect(isRoot('D', notes)).toBe(false);
  });

  it('treats the first element as root', () => {
    const notes: NoteName[] = ['G', 'B', 'D'];
    expect(isRoot('G', notes)).toBe(true);
    expect(isRoot('B', notes)).toBe(false);
    expect(isRoot('D', notes)).toBe(false);
  });

  it('works with a single highlighted note', () => {
    const notes: NoteName[] = ['E'];
    expect(isRoot('E', notes)).toBe(true);
    expect(isRoot('A', notes)).toBe(false);
  });
});
