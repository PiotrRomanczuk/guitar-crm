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

export type DisplayMode = 'scale' | 'chord' | 'none';

export interface FretboardState {
  rootNote: NoteName;
  scaleKey: string;
  chordKey: string;
  displayMode: DisplayMode;
  useFlats: boolean;
  showAllNotes: boolean;
  audioEnabled: boolean;
  volume: number;
  highlightedNotes: NoteName[];
  fretboard: NoteName[][];
}

export interface FretboardActions {
  setRootNote: (note: NoteName) => void;
  setScaleKey: (key: string) => void;
  setChordKey: (key: string) => void;
  setDisplayMode: (mode: DisplayMode) => void;
  toggleFlats: () => void;
  toggleShowAllNotes: () => void;
  toggleAudio: () => void;
  setVolume: (volume: number) => void;
  clearSelection: () => void;
}

export function useFretboard(): FretboardState & FretboardActions {
  const [rootNote, setRootNote] = useState<NoteName>('C');
  const [scaleKey, setScaleKey] = useState<string>('major');
  const [chordKey, setChordKey] = useState<string>('major');
  const [displayMode, setDisplayMode] = useState<DisplayMode>('scale');
  const [useFlats, setUseFlats] = useState(false);
  const [showAllNotes, setShowAllNotes] = useState(false);
  const [audioEnabled, setAudioEnabled] = useState(true);

  const { volume, setVolume: setAudioVolume } = useGuitarAudio();

  const fretboard = useMemo(() => buildFretboard(), []);

  const highlightedNotes = useMemo((): NoteName[] => {
    if (displayMode === 'scale') {
      return getScaleNotes(rootNote, scaleKey);
    }
    if (displayMode === 'chord') {
      return getChordNotes(rootNote, chordKey);
    }
    return [];
  }, [rootNote, scaleKey, chordKey, displayMode]);

  const toggleFlats = useCallback(() => setUseFlats((prev) => !prev), []);
  const toggleShowAllNotes = useCallback(() => setShowAllNotes((prev) => !prev), []);
  const toggleAudio = useCallback(() => setAudioEnabled((prev) => !prev), []);

  const clearSelection = useCallback(() => {
    setDisplayMode('none');
  }, []);

  return {
    rootNote,
    scaleKey,
    chordKey,
    displayMode,
    useFlats,
    showAllNotes,
    audioEnabled,
    volume,
    highlightedNotes,
    fretboard,
    setRootNote,
    setScaleKey,
    setChordKey,
    setDisplayMode,
    toggleFlats,
    toggleShowAllNotes,
    toggleAudio,
    setVolume: setAudioVolume,
    clearSelection,
  };
}

export { CHROMATIC_NOTES };
