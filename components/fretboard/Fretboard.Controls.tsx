'use client';

import { GraduationCap } from 'lucide-react';
import { type NoteName } from '@/lib/music-theory';
import { type DisplayMode, type NoteDisplayType } from './useFretboard';
import { type CAGEDShape } from './caged.helpers';
import { Button } from '@/components/ui/button';
import {
  ModeButtons, RootSelector, ScaleSelector,
  ChordSelector, ToggleButtons, AudioPanel,
  CagedSelector, TrainingBar,
} from './controls';

interface FretboardControlsProps {
  rootNote: NoteName;
  scaleKey: string;
  chordKey: string;
  displayMode: DisplayMode;
  noteDisplayType: NoteDisplayType;
  showFunctionalColors: boolean;
  useFlats: boolean;
  showAllNotes: boolean;
  onRootChange: (note: NoteName) => void;
  onScaleChange: (key: string) => void;
  onChordChange: (key: string) => void;
  onModeChange: (mode: DisplayMode) => void;
  onNoteDisplayTypeChange: (type: NoteDisplayType) => void;
  onToggleFunctionalColors: () => void;
  isPlaying: boolean;
  bpm: number;
  onTogglePlayback: () => void;
  onBpmChange: (bpm: number) => void;
  isTraining: boolean;
  targetNote: NoteName | null;
  score: { correct: number; total: number };
  trainingFeedback: 'correct' | 'wrong' | null;
  onStartTraining: () => void;
  onStopTraining: () => void;
  cagedShape: CAGEDShape | 'all' | 'none';
  onCagedShapeChange: (shape: CAGEDShape | 'all' | 'none') => void;
  onToggleFlats: () => void;
  onToggleAllNotes: () => void;
  onClear: () => void;
  volume?: number;
  onVolumeChange?: (volume: number) => void;
  audioEnabled?: boolean;
  onToggleAudio?: () => void;
}

export function FretboardControls(p: FretboardControlsProps) {
  return (
    <div className="space-y-4">
      <div className="flex flex-wrap items-center gap-3">
        <ModeButtons displayMode={p.displayMode} onModeChange={p.onModeChange} onClear={p.onClear} />
        <RootSelector rootNote={p.rootNote} useFlats={p.useFlats} onChange={p.onRootChange} />
        <CagedSelector value={p.cagedShape} onChange={p.onCagedShapeChange} />
        {!p.isTraining && (
          <Button variant="outline" size="sm" onClick={p.onStartTraining} className="ml-auto">
            <GraduationCap className="h-4 w-4 mr-1" /> Start Training
          </Button>
        )}
      </div>

      {p.isTraining && (
        <TrainingBar
          targetNote={p.targetNote} score={p.score}
          trainingFeedback={p.trainingFeedback} useFlats={p.useFlats}
          onStopTraining={p.onStopTraining}
        />
      )}

      <div className="flex flex-wrap items-center gap-3">
        {p.displayMode === 'scale' && <ScaleSelector scaleKey={p.scaleKey} onChange={p.onScaleChange} />}
        {p.displayMode === 'chord' && <ChordSelector chordKey={p.chordKey} onChange={p.onChordChange} />}
        <ToggleButtons
          useFlats={p.useFlats} showAllNotes={p.showAllNotes}
          noteDisplayType={p.noteDisplayType} showFunctionalColors={p.showFunctionalColors}
          onToggleFlats={p.onToggleFlats} onToggleAllNotes={p.onToggleAllNotes}
          onNoteDisplayTypeChange={p.onNoteDisplayTypeChange}
          onToggleFunctionalColors={p.onToggleFunctionalColors}
        />
      </div>

      <AudioPanel
        isPlaying={p.isPlaying} bpm={p.bpm}
        onTogglePlayback={p.onTogglePlayback} onBpmChange={p.onBpmChange}
        volume={p.volume} onVolumeChange={p.onVolumeChange}
        audioEnabled={p.audioEnabled} onToggleAudio={p.onToggleAudio}
      />
    </div>
  );
}
