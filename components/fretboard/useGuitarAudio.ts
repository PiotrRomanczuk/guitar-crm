'use client';

import { useEffect, useRef, useState, useCallback } from 'react';
import * as Tone from 'tone';
import { type NoteName } from '@/lib/music-theory';

/**
 * Calculate the correct note name and octave for a given string and fret.
 * Uses absolute semitone position to avoid double-counting octave adjustments.
 */
function getNoteWithOctave(stringIndex: number, fret: number): string {
  const baseOctaves = [2, 2, 3, 3, 3, 4]; // E2, A2, D3, G3, B3, E4
  const chromaticNotes: NoteName[] = ['C', 'C#', 'D', 'D#', 'E', 'F', 'F#', 'G', 'G#', 'A', 'A#', 'B'];
  const baseNotes: NoteName[] = ['E', 'A', 'D', 'G', 'B', 'E'];

  const baseNoteIndex = chromaticNotes.indexOf(baseNotes[stringIndex]);
  const absolutePosition = baseOctaves[stringIndex] * 12 + baseNoteIndex + fret;
  const resultOctave = Math.floor(absolutePosition / 12);
  const resultNote = chromaticNotes[absolutePosition % 12];

  return `${resultNote}${resultOctave}`;
}

export interface GuitarAudioControls {
  playNote: (stringIndex: number, fret: number, note: NoteName) => Promise<void>;
  volume: number;
  setVolume: (volume: number) => void;
  isReady: boolean;
}

export function useGuitarAudio(): GuitarAudioControls {
  const synthRef = useRef<Tone.PolySynth | null>(null);
  const [volume, setVolumeState] = useState(-12); // dB (-12 is a good default)
  const [isReady, setIsReady] = useState(false);

  // Initialize Tone.js synth
  useEffect(() => {
    const initAudio = async () => {
      try {
        // Create a guitar-like synth using PluckSynth
        synthRef.current = new Tone.PolySynth(Tone.Synth, {
          oscillator: {
            type: 'triangle',
          },
          envelope: {
            attack: 0.002,
            decay: 0.3,
            sustain: 0.1,
            release: 1.2,
          },
        }).toDestination();

        synthRef.current.volume.value = volume;
        setIsReady(true);
      } catch (error) {
        console.error('Failed to initialize audio:', error);
      }
    };

    initAudio();

    // Cleanup on unmount
    return () => {
      if (synthRef.current) {
        synthRef.current.dispose();
        synthRef.current = null;
      }
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps -- intentional: run only on mount; volume is handled by a separate effect
  }, []);

  // Update volume when it changes
  useEffect(() => {
    if (synthRef.current) {
      synthRef.current.volume.value = volume;
    }
  }, [volume]);

  const playNote = useCallback(
    async (stringIndex: number, fret: number, _note: NoteName) => {
      if (!synthRef.current || !isReady) return;

      try {
        // Start audio context on user interaction (browser requirement)
        if (Tone.getContext().state !== 'running') {
          await Tone.start();
        }

        // Calculate the correct octave based on string and fret
        const toneNote = getNoteWithOctave(stringIndex, fret);

        // Play the note (short duration for plucked sound)
        synthRef.current.triggerAttackRelease(toneNote, '0.8n');
      } catch (error) {
        console.error('Failed to play note:', error);
      }
    },
    [isReady],
  );

  const setVolume = useCallback((newVolume: number) => {
    // Clamp volume between -60 and 0 dB
    const clampedVolume = Math.max(-60, Math.min(0, newVolume));
    setVolumeState(clampedVolume);
  }, []);

  return {
    playNote,
    volume,
    setVolume,
    isReady,
  };
}
