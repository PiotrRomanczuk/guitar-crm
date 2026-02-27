'use client';

import { Check, X } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { type NoteName } from '@/lib/music-theory';
import { formatNoteDisplay } from '../fretboard.helpers';

interface TrainingBarProps {
  targetNote: NoteName | null;
  score: { correct: number; total: number };
  trainingFeedback: 'correct' | 'wrong' | null;
  useFlats: boolean;
  onStopTraining: () => void;
}

export function TrainingBar({
  targetNote,
  score,
  trainingFeedback,
  useFlats,
  onStopTraining,
}: TrainingBarProps) {
  return (
    <div className="flex flex-wrap items-center gap-4 bg-primary/10 p-3 rounded-lg border border-primary/20">
      <div className="flex items-center gap-2">
        <span className="text-sm font-semibold">Find Note:</span>
        <span className="text-xl font-bold text-primary animate-pulse">
          {targetNote ? formatNoteDisplay(targetNote, useFlats) : '...'}
        </span>
      </div>
      <div className="flex items-center gap-2 ml-4">
        <span className="text-sm font-medium">Score:</span>
        <span className="font-mono bg-background px-2 py-0.5 rounded border">
          {score.correct} / {score.total}
        </span>
      </div>
      {trainingFeedback && (
        <div
          className={`text-sm font-bold px-3 py-1 rounded-full animate-bounce ${
            trainingFeedback === 'correct'
              ? 'bg-green-100 text-green-700 dark:bg-green-900/40 dark:text-green-400'
              : 'bg-red-100 text-red-700 dark:bg-red-900/40 dark:text-red-400'
          }`}
        >
          {trainingFeedback === 'correct' ? (
            <span className="flex items-center gap-1">
              <Check className="h-4 w-4" /> Correct!
            </span>
          ) : (
            <span className="flex items-center gap-1">
              <X className="h-4 w-4" /> Try Again
            </span>
          )}
        </div>
      )}
      <Button variant="ghost" size="sm" onClick={onStopTraining} className="ml-auto">
        Stop Training
      </Button>
    </div>
  );
}
