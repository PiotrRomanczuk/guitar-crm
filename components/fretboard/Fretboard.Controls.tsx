'use client';

import { CHROMATIC_NOTES, type NoteName } from '@/lib/music-theory';
import { SCALE_DEFINITIONS } from '@/lib/music-theory/scales';
import { CHORD_DEFINITIONS } from '@/lib/music-theory/chords';
import { type DisplayMode, type NoteDisplayType } from './useFretboard';
import { type CAGEDShape } from './caged.helpers';
import { formatNoteDisplay } from './fretboard.helpers';
import { ToggleGroup, ToggleGroupItem } from '@/components/ui/toggle-group';
import { Button } from '@/components/ui/button';

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

export function FretboardControls({
  rootNote,
  scaleKey,
  chordKey,
  displayMode,
  noteDisplayType,
  showFunctionalColors,
  useFlats,
  showAllNotes,
  onRootChange,
  onScaleChange,
  onChordChange,
  onModeChange,
  onNoteDisplayTypeChange,
  onToggleFunctionalColors,
  isPlaying,
  bpm,
  onTogglePlayback,
  onBpmChange,
  isTraining,
  targetNote,
  score,
  trainingFeedback,
  onStartTraining,
  onStopTraining,
  cagedShape,
  onCagedShapeChange,
  onToggleFlats,
  onToggleAllNotes,
  onClear,
  volume,
  onVolumeChange,
  audioEnabled,
  onToggleAudio,
}: FretboardControlsProps) {
  return (
    <div className="space-y-4">
      {/* Mode selector + root note */}
      <div className="flex flex-wrap items-center gap-3">
        <ModeButtons displayMode={displayMode} onModeChange={onModeChange} onClear={onClear} />
        <RootSelector rootNote={rootNote} useFlats={useFlats} onChange={onRootChange} />
        <CagedSelector value={cagedShape} onChange={onCagedShapeChange} />
        {!isTraining && (
          <Button variant="outline" size="sm" onClick={onStartTraining} className="ml-auto">
            🎓 Start Training
          </Button>
        )}
      </div>

      {/* training overlay */}
      {isTraining && (
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
              className={`text-sm font-bold px-3 py-1 rounded-full animate-bounce ${trainingFeedback === 'correct'
                ? 'bg-green-100 text-green-700 dark:bg-green-900/40 dark:text-green-400'
                : 'bg-red-100 text-red-700 dark:bg-red-900/40 dark:text-red-400'
                }`}
            >
              {trainingFeedback === 'correct' ? '✓ Correct!' : '✗ Try Again'}
            </div>
          )}
          <Button variant="ghost" size="sm" onClick={onStopTraining} className="ml-auto">
            Stop Training
          </Button>
        </div>
      )}

      {/* Scale or chord selector based on mode */}
      <div className="flex flex-wrap items-center gap-3">
        {displayMode === 'scale' && (
          <ScaleSelector scaleKey={scaleKey} onChange={onScaleChange} />
        )}
        {displayMode === 'chord' && (
          <ChordSelector chordKey={chordKey} onChange={onChordChange} />
        )}
        <ToggleButtons
          useFlats={useFlats}
          showAllNotes={showAllNotes}
          noteDisplayType={noteDisplayType}
          showFunctionalColors={showFunctionalColors}
          onToggleFlats={onToggleFlats}
          onToggleAllNotes={onToggleAllNotes}
          onNoteDisplayTypeChange={onNoteDisplayTypeChange}
          onToggleFunctionalColors={onToggleFunctionalColors}
        />
      </div>

      {/* Audio controls */}
      {(volume !== undefined || audioEnabled !== undefined) && (
        <div className="flex flex-wrap items-center gap-3 border-t border-border pt-3">
          {onToggleAudio !== undefined && audioEnabled !== undefined && (
            <Button
              variant={audioEnabled ? 'default' : 'outline'}
              size="sm"
              onClick={onToggleAudio}
            >
              {audioEnabled ? '🔊 Audio On' : '🔇 Audio Off'}
            </Button>
          )}
          {volume !== undefined && onVolumeChange && (
            <VolumeControl volume={volume} onChange={onVolumeChange} />
          )}
          <div className="flex items-center gap-2 border-l border-border pl-3 ml-auto">
            <Button
              variant={isPlaying ? 'destructive' : 'default'}
              size="sm"
              onClick={onTogglePlayback}
              className="w-24"
            >
              {isPlaying ? '⏹ Stop' : '▶ Play'}
            </Button>
            <BpmControl bpm={bpm} onChange={onBpmChange} />
          </div>
        </div>
      )}
    </div>
  );
}

function ModeButtons({
  displayMode,
  onModeChange,
  onClear,
}: {
  displayMode: DisplayMode;
  onModeChange: (mode: DisplayMode) => void;
  onClear: () => void;
}) {
  return (
    <div className="flex items-center gap-2">
      <ToggleGroup
        type="single"
        value={displayMode}
        onValueChange={(value) => value && onModeChange(value as DisplayMode)}
        variant="outline"
      >
        <ToggleGroupItem value="scale" aria-label="Show scales">
          Scales
        </ToggleGroupItem>
        <ToggleGroupItem value="chord" aria-label="Show chords">
          Chords
        </ToggleGroupItem>
      </ToggleGroup>
      <Button
        variant="ghost"
        size="sm"
        onClick={onClear}
        className="text-muted-foreground"
      >
        Clear
      </Button>
    </div>
  );
}

function RootSelector({
  rootNote,
  useFlats,
  onChange,
}: {
  rootNote: NoteName;
  useFlats: boolean;
  onChange: (note: NoteName) => void;
}) {
  return (
    <div className="flex items-center gap-2">
      <label className="text-sm font-medium text-muted-foreground">Root:</label>
      <select
        value={rootNote}
        onChange={(e) => onChange(e.target.value as NoteName)}
        className="rounded-md border border-border bg-background px-3 py-1.5 text-sm focus:outline-none focus:ring-2 focus:ring-ring"
      >
        {CHROMATIC_NOTES.map((note) => (
          <option key={note} value={note}>
            {formatNoteDisplay(note, useFlats)}
          </option>
        ))}
      </select>
    </div>
  );
}

function ScaleSelector({
  scaleKey,
  onChange,
}: {
  scaleKey: string;
  onChange: (key: string) => void;
}) {
  return (
    <div className="flex items-center gap-2">
      <label className="text-sm font-medium text-muted-foreground">Scale:</label>
      <select
        value={scaleKey}
        onChange={(e) => onChange(e.target.value)}
        className="rounded-md border border-border bg-background px-3 py-1.5 text-sm focus:outline-none focus:ring-2 focus:ring-ring"
      >
        {Object.entries(SCALE_DEFINITIONS).map(([key, def]) => (
          <option key={key} value={key}>{def.name}</option>
        ))}
      </select>
    </div>
  );
}

function ChordSelector({
  chordKey,
  onChange,
}: {
  chordKey: string;
  onChange: (key: string) => void;
}) {
  return (
    <div className="flex items-center gap-2">
      <label className="text-sm font-medium text-muted-foreground">Chord:</label>
      <select
        value={chordKey}
        onChange={(e) => onChange(e.target.value)}
        className="rounded-md border border-border bg-background px-3 py-1.5 text-sm focus:outline-none focus:ring-2 focus:ring-ring"
      >
        {Object.entries(CHORD_DEFINITIONS).map(([key, def]) => (
          <option key={key} value={key}>{def.name}</option>
        ))}
      </select>
    </div>
  );
}

function ToggleButtons({
  useFlats,
  showAllNotes,
  noteDisplayType,
  showFunctionalColors,
  onToggleFlats,
  onToggleAllNotes,
  onNoteDisplayTypeChange,
  onToggleFunctionalColors,
}: {
  useFlats: boolean;
  showAllNotes: boolean;
  noteDisplayType: NoteDisplayType;
  showFunctionalColors: boolean;
  onToggleFlats: () => void;
  onToggleAllNotes: () => void;
  onNoteDisplayTypeChange: (type: NoteDisplayType) => void;
  onToggleFunctionalColors: () => void;
}) {
  return (
    <div className="flex flex-wrap items-center gap-2 ml-auto">
      <ToggleGroup
        type="single"
        value={noteDisplayType}
        onValueChange={(value) => value && onNoteDisplayTypeChange(value as NoteDisplayType)}
        variant="outline"
        size="sm"
      >
        <ToggleGroupItem value="name">Notes</ToggleGroupItem>
        <ToggleGroupItem value="interval">Intervals</ToggleGroupItem>
      </ToggleGroup>

      <Button
        variant={showFunctionalColors ? 'default' : 'outline'}
        size="sm"
        onClick={onToggleFunctionalColors}
        title="Color notes by function (Root, 3rd, 5th, etc.)"
      >
        {showFunctionalColors ? '🎨 Colors On' : '🎨 Colors Off'}
      </Button>

      <div className="flex items-center gap-2 border-l border-border pl-2 ml-2">
        <Button
          variant={useFlats ? 'default' : 'outline'}
          size="sm"
          onClick={onToggleFlats}
        >
          {useFlats ? 'b Flats' : '# Sharps'}
        </Button>
        <Button
          variant={showAllNotes ? 'default' : 'outline'}
          size="sm"
          onClick={onToggleAllNotes}
        >
          {showAllNotes ? 'All Notes' : 'Scale Only'}
        </Button>
      </div>
    </div>
  );
}

function VolumeControl({
  volume,
  onChange,
}: {
  volume: number;
  onChange: (volume: number) => void;
}) {
  // Convert dB to percentage for display (0 to 100)
  const volumePercent = Math.round(((volume + 60) / 60) * 100);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    // Convert percentage back to dB (-60 to 0)
    const percent = parseInt(e.target.value);
    const dB = (percent / 100) * 60 - 60;
    onChange(dB);
  };

  return (
    <div className="flex items-center gap-2">
      <label className="text-sm font-medium text-muted-foreground">Volume:</label>
      <input
        type="range"
        min="0"
        max="100"
        value={volumePercent}
        onChange={handleChange}
        className="w-32 h-2 bg-muted rounded-lg appearance-none cursor-pointer accent-primary"
      />
      <span className="text-xs text-muted-foreground w-10 text-right">{volumePercent}%</span>
    </div>
  );
}

function CagedSelector({
  value,
  onChange,
}: {
  value: CAGEDShape | 'all' | 'none';
  onChange: (value: CAGEDShape | 'all' | 'none') => void;
}) {
  return (
    <div className="flex items-center gap-2">
      <label className="text-sm font-medium text-muted-foreground mr-1">CAGED:</label>
      <ToggleGroup
        type="single"
        value={value}
        onValueChange={(val) => val && onChange(val as any)}
        variant="outline"
        size="sm"
      >
        <ToggleGroupItem value="none">None</ToggleGroupItem>
        <ToggleGroupItem value="C">C</ToggleGroupItem>
        <ToggleGroupItem value="A">A</ToggleGroupItem>
        <ToggleGroupItem value="G">G</ToggleGroupItem>
        <ToggleGroupItem value="E">E</ToggleGroupItem>
        <ToggleGroupItem value="D">D</ToggleGroupItem>
        <ToggleGroupItem value="all">All</ToggleGroupItem>
      </ToggleGroup>
    </div>
  );
}

function BpmControl({
  bpm,
  onChange,
}: {
  bpm: number;
  onChange: (bpm: number) => void;
}) {
  return (
    <div className="flex items-center gap-2">
      <label className="text-sm font-medium text-muted-foreground">BPM:</label>
      <input
        type="range"
        min="40"
        max="240"
        value={bpm}
        onChange={(e) => onChange(parseInt(e.target.value))}
        className="w-24 h-2 bg-muted rounded-lg appearance-none cursor-pointer accent-primary"
      />
      <span className="text-xs text-muted-foreground w-8 text-right font-mono">{bpm}</span>
    </div>
  );
}
