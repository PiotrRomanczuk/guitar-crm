export {
  CHROMATIC_NOTES,
  STANDARD_TUNING,
  TOTAL_FRETS,
  ENHARMONIC_MAP,
  getNoteAtFret,
  buildFretboard,
  getNoteIndex,
  noteFromIndex,
  formatNote,
  type NoteName,
} from './notes';

export {
  SCALE_DEFINITIONS,
  getScaleNotes,
  isNoteInScale,
  getNoteDegree,
  type ScaleDefinition,
} from './scales';

export {
  CHORD_DEFINITIONS,
  getChordNotes,
  isNoteInChord,
  getChordDisplayName,
  type ChordDefinition,
} from './chords';
