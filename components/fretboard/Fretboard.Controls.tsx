'use client';

import { CHROMATIC_NOTES, type NoteName } from '@/lib/music-theory';
import { SCALE_DEFINITIONS } from '@/lib/music-theory/scales';
import { CHORD_DEFINITIONS } from '@/lib/music-theory/chords';
import { type DisplayMode } from './useFretboard';
import { formatNoteDisplay } from './fretboard.helpers';
import { ToggleGroup, ToggleGroupItem } from '@/components/ui/toggle-group';
import { Button } from '@/components/ui/button';

interface FretboardControlsProps {
  rootNote: NoteName;
  scaleKey: string;
  chordKey: string;
  displayMode: DisplayMode;
  useFlats: boolean;
  showAllNotes: boolean;
  onRootChange: (note: NoteName) => void;
  onScaleChange: (key: string) => void;
  onChordChange: (key: string) => void;
  onModeChange: (mode: DisplayMode) => void;
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
  useFlats,
  showAllNotes,
  onRootChange,
  onScaleChange,
  onChordChange,
  onModeChange,
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
      </div>

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
          onToggleFlats={onToggleFlats}
          onToggleAllNotes={onToggleAllNotes}
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
  onToggleFlats,
  onToggleAllNotes,
}: {
  useFlats: boolean;
  showAllNotes: boolean;
  onToggleFlats: () => void;
  onToggleAllNotes: () => void;
}) {
  return (
    <div className="flex items-center gap-2 ml-auto">
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
