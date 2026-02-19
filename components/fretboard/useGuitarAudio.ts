'use client';

import { useEffect, useRef, useState, useCallback } from 'react';
import * as Tone from 'tone';
import { type NoteName } from '@/lib/music-theory';

/**
 * Standard tuning with octave numbers for Tone.js
 * String 6 (low E) = E2, String 5 (A) = A2, String 4 (D) = D3,
 * String 3 (G) = G3, String 2 (B) = B3, String 1 (high E) = E4
 */
const STRING_BASE_NOTES = ['E2', 'A2', 'D3', 'G3', 'B3', 'E4'];

/**
 * Convert a NoteName and octave to Tone.js format (e.g., "C4")
 */
function toToneNote(note: NoteName, octave: number): string {
  return `${note}${octave}`;
}

/**
 * Calculate the octave and semitone offset for a given string and fret
 */
function getNoteWithOctave(stringIndex: number, fret: number, note: NoteName): string {
  // Start with the base octave for each string
  const baseNotes = ['E', 'A', 'D', 'G', 'B', 'E'];
  const baseOctaves = [2, 2, 3, 3, 3, 4];

  // Calculate total semitones from the base note
  const chromaticNotes: NoteName[] = ['C', 'C#', 'D', 'D#', 'E', 'F', 'F#', 'G', 'G#', 'A', 'A#', 'B'];
  const baseNote = baseNotes[stringIndex];
  const baseNoteIndex = chromaticNotes.indexOf(baseNote as NoteName);
  const currentNoteIndex = chromaticNotes.indexOf(note);

  // Calculate octave adjustment
  let octave = baseOctaves[stringIndex];
  if (currentNoteIndex < baseNoteIndex && fret > 0) {
    octave += 1;
  }

  // Add octave adjustments for higher frets
  const totalSemitones = baseNoteIndex + fret;
  const octaveAdjust = Math.floor(totalSemitones / 12);
  octave += octaveAdjust;

  return toToneNote(note, octave);
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
  }, []);

  // Update volume when it changes
  useEffect(() => {
    if (synthRef.current) {
      synthRef.current.volume.value = volume;
    }
  }, [volume]);

  const playNote = useCallback(
    async (stringIndex: number, fret: number, note: NoteName) => {
      if (!synthRef.current || !isReady) return;

      try {
        // Start audio context on user interaction (browser requirement)
        if (Tone.getContext().state !== 'running') {
          await Tone.start();
        }

        // Calculate the correct octave based on string and fret
        const toneNote = getNoteWithOctave(stringIndex, fret, note);

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
