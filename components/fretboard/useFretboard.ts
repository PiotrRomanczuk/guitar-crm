'use client';

import { useState, useMemo, useCallback, useEffect, useRef } from 'react';
import {
  type NoteName,
  CHROMATIC_NOTES,
  buildFretboard,
  getScaleNotes,
  getChordNotes,
} from '@/lib/music-theory';
import { useGuitarAudio } from './useGuitarAudio';
import { type CAGEDShape, getActiveCAGEDShapes, type CAGEDActiveShape } from './caged.helpers';

export type DisplayMode = 'scale' | 'chord' | 'none';
export type NoteDisplayType = 'name' | 'interval';

export interface FretboardState {
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
  isPlaying: boolean;
  bpm: number;
  activeNoteIndex: number | null;
  isTraining: boolean;
  targetNote: NoteName | null;
  score: { correct: number; total: number };
  trainingFeedback: 'correct' | 'wrong' | null;
  cagedShape: CAGEDShape | 'all' | 'none';
  activeCAGEDShapes: CAGEDActiveShape[];
  highlightedNotes: NoteName[];
  fretboard: NoteName[][];
}

export interface FretboardActions {
  setRootNote: (note: NoteName) => void;
  setScaleKey: (key: string) => void;
  setChordKey: (key: string) => void;
  setDisplayMode: (mode: DisplayMode) => void;
  setNoteDisplayType: (type: NoteDisplayType) => void;
  toggleFunctionalColors: () => void;
  toggleFlats: () => void;
  toggleShowAllNotes: () => void;
  toggleAudio: () => void;
  togglePlayback: () => void;
  setBpm: (bpm: number) => void;
  startTraining: () => void;
  stopTraining: () => void;
  submitNote: (note: NoteName) => void;
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
  const [isPlaying, setIsPlaying] = useState(false);
  const [bpm, setBpm] = useState(120);
  const [activeNoteIndex, setActiveNoteIndex] = useState<number | null>(null);

  const [isTraining, setIsTraining] = useState(false);
  const [targetNote, setTargetNote] = useState<NoteName | null>(null);
  const [score, setScore] = useState({ correct: 0, total: 0 });
  const [trainingFeedback, setTrainingFeedback] = useState<'correct' | 'wrong' | null>(null);

  const [cagedShape, setCagedShape] = useState<CAGEDShape | 'all' | 'none'>('none');

  const { volume, setVolume: setAudioVolume, playNote, isReady } = useGuitarAudio();

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

  const toggleFunctionalColors = useCallback(() => setShowFunctionalColors((prev) => !prev), []);
  const toggleFlats = useCallback(() => setUseFlats((prev) => !prev), []);
  const toggleShowAllNotes = useCallback(() => setShowAllNotes((prev) => !prev), []);
  const toggleAudio = useCallback(() => setAudioEnabled((prev) => !prev), []);
  const togglePlayback = useCallback(() => setIsPlaying((prev) => !prev), []);

  // Sequencer playback loop
  useEffect(() => {
    let timer: NodeJS.Timeout;

    if (isPlaying && highlightedNotes.length > 0) {
      const interval = (60 / bpm) * 1000;
      let currentIndex = 0;

      const playNextNote = () => {
        const note = highlightedNotes[currentIndex];
        // Find first occurrence on fretboard to play (prefer lower strings/higher frets or whatever is reasonable)
        // For simplicity, let's just find the first string that has this note
        let found = false;
        for (let s = 0; s < 6; s++) {
          for (let f = 0; f <= 15; f++) {
            if (fretboard[s][f] === note) {
              playNote(s, f, note);
              found = true;
              break;
            }
          }
          if (found) break;
        }

        setActiveNoteIndex(currentIndex);
        currentIndex = (currentIndex + 1) % highlightedNotes.length;
        timer = setTimeout(playNextNote, interval);
      };

      playNextNote();
    } else {
      setActiveNoteIndex(null);
    }

    return () => {
      if (timer) clearTimeout(timer);
    };
  }, [isPlaying, highlightedNotes, bpm, playNote, fretboard]);

  const startTraining = useCallback(() => {
    setIsTraining(true);
    setScore({ correct: 0, total: 0 });
    const randomNote = CHROMATIC_NOTES[Math.floor(Math.random() * CHROMATIC_NOTES.length)];
    setTargetNote(randomNote);
    setTrainingFeedback(null);
  }, []);

  const stopTraining = useCallback(() => {
    setIsTraining(false);
    setTargetNote(null);
    setTrainingFeedback(null);
  }, []);

  const submitNote = useCallback(
    (note: NoteName) => {
      if (!isTraining || !targetNote) return;

      if (note === targetNote) {
        setScore((prev) => ({ correct: prev.correct + 1, total: prev.total + 1 }));
        setTrainingFeedback('correct');
        // Pick new note after delay
        setTimeout(() => {
          const nextNote = CHROMATIC_NOTES[Math.floor(Math.random() * CHROMATIC_NOTES.length)];
          setTargetNote(nextNote);
          setTrainingFeedback(null);
        }, 1000);
      } else {
        setScore((prev) => ({ ...prev, total: prev.total + 1 }));
        setTrainingFeedback('wrong');
        setTimeout(() => setTrainingFeedback(null), 1000);
      }
    },
    [isTraining, targetNote],
  );

  const activeCAGEDShapes = useMemo(() => {
    if (cagedShape === 'none') return [];
    const all = getActiveCAGEDShapes(rootNote, fretboard);
    if (cagedShape === 'all') return all;
    return all.filter((s) => s.name === cagedShape);
  }, [cagedShape, rootNote, fretboard]);

  const clearSelection = useCallback(() => {
    setDisplayMode('none');
    stopTraining();
    setCagedShape('none');
  }, [stopTraining]);

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
    isPlaying,
    bpm,
    activeNoteIndex,
    isTraining,
    targetNote,
    score,
    trainingFeedback,
    cagedShape,
    activeCAGEDShapes,
    highlightedNotes,
    fretboard,
    setRootNote,
    setScaleKey,
    setChordKey,
    setDisplayMode,
    setNoteDisplayType,
    toggleFunctionalColors,
    toggleFlats,
    toggleShowAllNotes,
    toggleAudio,
    togglePlayback,
    setBpm,
    startTraining,
    stopTraining,
    submitNote,
    setCagedShape,
    setVolume: setAudioVolume,
    clearSelection,
  };
}

export { CHROMATIC_NOTES };
