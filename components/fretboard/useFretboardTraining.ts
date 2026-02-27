'use client';

import { useState, useCallback } from 'react';
import { CHROMATIC_NOTES, type NoteName } from '@/lib/music-theory';

export interface TrainingState {
  isTraining: boolean;
  targetNote: NoteName | null;
  score: { correct: number; total: number };
  trainingFeedback: 'correct' | 'wrong' | null;
}

export interface TrainingActions {
  startTraining: () => void;
  stopTraining: () => void;
  submitNote: (note: NoteName) => void;
}

export function useFretboardTraining(): TrainingState & TrainingActions {
  const [isTraining, setIsTraining] = useState(false);
  const [targetNote, setTargetNote] = useState<NoteName | null>(null);
  const [score, setScore] = useState({ correct: 0, total: 0 });
  const [trainingFeedback, setTrainingFeedback] = useState<'correct' | 'wrong' | null>(null);

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

  return {
    isTraining,
    targetNote,
    score,
    trainingFeedback,
    startTraining,
    stopTraining,
    submitNote,
  };
}
