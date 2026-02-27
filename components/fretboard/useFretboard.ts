'use client';

import { useState, useMemo, useCallback } from 'react';
import {
  type NoteName,
  CHROMATIC_NOTES,
  buildFretboard,
  getScaleNotes,
  getChordNotes,
} from '@/lib/music-theory';
import { useGuitarAudio } from './useGuitarAudio';
import { type CAGEDShape, getActiveCAGEDShapes, type CAGEDActiveShape } from './caged.helpers';
import { useFretboardTraining, type TrainingState, type TrainingActions } from './useFretboardTraining';
import { useFretboardPlayback, type PlaybackState, type PlaybackActions, type ActiveCell } from './useFretboardPlayback';

export type DisplayMode = 'scale' | 'chord' | 'none';
export type NoteDisplayType = 'name' | 'interval';

export interface FretboardState extends TrainingState, PlaybackState {
  rootNote: NoteName;
  scaleKey: string;
  chordKey: string;
  displayMode: DisplayMode;
  noteDisplayType: NoteDisplayType;
  showFunctionalColors: boolean;
  useFlats: boolean;
  showAllNotes: boolean;
  audioEnabled: boolean;
  volume: number;
  cagedShape: CAGEDShape | 'all' | 'none';
  activeCAGEDShapes: CAGEDActiveShape[];
  highlightedNotes: NoteName[];
  fretboard: NoteName[][];
  playNote: (stringIndex: number, fret: number, note: NoteName) => Promise<void>;
  isReady: boolean;
}

export interface FretboardActions extends TrainingActions, PlaybackActions {
  setRootNote: (note: NoteName) => void;
  setScaleKey: (key: string) => void;
  setChordKey: (key: string) => void;
  setDisplayMode: (mode: DisplayMode) => void;
  setNoteDisplayType: (type: NoteDisplayType) => void;
  toggleFunctionalColors: () => void;
  toggleFlats: () => void;
  toggleShowAllNotes: () => void;
  toggleAudio: () => void;
  setCagedShape: (shape: CAGEDShape | 'all' | 'none') => void;
  setVolume: (volume: number) => void;
  clearSelection: () => void;
}

export function useFretboard(): FretboardState & FretboardActions {
  const [rootNote, setRootNote] = useState<NoteName>('C');
  const [scaleKey, setScaleKey] = useState<string>('major');
  const [chordKey, setChordKey] = useState<string>('major');
  const [displayMode, setDisplayMode] = useState<DisplayMode>('scale');
  const [noteDisplayType, setNoteDisplayType] = useState<NoteDisplayType>('name');
  const [showFunctionalColors, setShowFunctionalColors] = useState(true);
  const [useFlats, setUseFlats] = useState(false);
  const [showAllNotes, setShowAllNotes] = useState(false);
  const [audioEnabled, setAudioEnabled] = useState(true);
  const [cagedShape, setCagedShape] = useState<CAGEDShape | 'all' | 'none'>('none');

  const { volume, setVolume: setAudioVolume, playNote, isReady } = useGuitarAudio();

  const fretboard = useMemo(() => buildFretboard(), []);

  const highlightedNotes = useMemo((): NoteName[] => {
    if (displayMode === 'scale') return getScaleNotes(rootNote, scaleKey);
    if (displayMode === 'chord') return getChordNotes(rootNote, chordKey);
    return [];
  }, [rootNote, scaleKey, chordKey, displayMode]);

  const training = useFretboardTraining();
  const playback = useFretboardPlayback(highlightedNotes, fretboard, playNote);

  const toggleFunctionalColors = useCallback(() => setShowFunctionalColors((prev) => !prev), []);
  const toggleFlats = useCallback(() => setUseFlats((prev) => !prev), []);
  const toggleShowAllNotes = useCallback(() => setShowAllNotes((prev) => !prev), []);
  const toggleAudio = useCallback(() => setAudioEnabled((prev) => !prev), []);

  const activeCAGEDShapes = useMemo(() => {
    if (cagedShape === 'none') return [];
    const all = getActiveCAGEDShapes(rootNote, fretboard);
    if (cagedShape === 'all') return all;
    return all.filter((s) => s.name === cagedShape);
  }, [cagedShape, rootNote, fretboard]);

  const clearSelection = useCallback(() => {
    setDisplayMode('none');
    training.stopTraining();
    setCagedShape('none');
  }, [training]);

  return {
    rootNote,
    scaleKey,
    chordKey,
    displayMode,
    noteDisplayType,
    showFunctionalColors,
    useFlats,
    showAllNotes,
    audioEnabled,
    volume,
    cagedShape,
    activeCAGEDShapes,
    highlightedNotes,
    fretboard,
    playNote,
    isReady,
    ...training,
    ...playback,
    setRootNote,
    setScaleKey,
    setChordKey,
    setDisplayMode,
    setNoteDisplayType,
    toggleFunctionalColors,
    toggleFlats,
    toggleShowAllNotes,
    toggleAudio,
    setCagedShape,
    setVolume: setAudioVolume,
    clearSelection,
  };
}

export type { ActiveCell };
export { CHROMATIC_NOTES };
