'use client';

import { useState, useCallback, useEffect } from 'react';
import { type NoteName } from '@/lib/music-theory';

export interface ActiveCell {
  stringIndex: number;
  fret: number;
}

export interface PlaybackState {
  isPlaying: boolean;
  bpm: number;
  activeCell: ActiveCell | null;
}

export interface PlaybackActions {
  togglePlayback: () => void;
  setBpm: (bpm: number) => void;
}

export function useFretboardPlayback(
  highlightedNotes: NoteName[],
  fretboard: NoteName[][],
  playNote: (stringIndex: number, fret: number, note: NoteName) => Promise<void>,
): PlaybackState & PlaybackActions {
  const [isPlaying, setIsPlaying] = useState(false);
  const [bpm, setBpm] = useState(120);
  const [activeCell, setActiveCell] = useState<ActiveCell | null>(null);

  const togglePlayback = useCallback(() => setIsPlaying((prev) => !prev), []);

  // Sequencer playback loop
  useEffect(() => {
    let timer: NodeJS.Timeout;

    if (isPlaying && highlightedNotes.length > 0) {
      const interval = (60 / bpm) * 1000;
      let currentIndex = 0;

      const playNextNote = () => {
        const note = highlightedNotes[currentIndex];
        let found = false;
        for (let s = 0; s < 6; s++) {
          for (let f = 0; f <= 15; f++) {
            if (fretboard[s][f] === note) {
              playNote(s, f, note);
              setActiveCell({ stringIndex: s, fret: f });
              found = true;
              break;
            }
          }
          if (found) break;
        }

        currentIndex = (currentIndex + 1) % highlightedNotes.length;
        timer = setTimeout(playNextNote, interval);
      };

      playNextNote();
    } else {
      queueMicrotask(() => setActiveCell(null));
    }

    return () => {
      if (timer) clearTimeout(timer);
    };
  }, [isPlaying, highlightedNotes, bpm, playNote, fretboard]);

  return {
    isPlaying,
    bpm,
    activeCell,
    togglePlayback,
    setBpm,
  };
}
