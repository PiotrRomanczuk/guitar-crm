'use client';

import {
  FretboardGrid,
  FretboardControls,
  FretboardInfo,
  useFretboard,
} from '@/components/fretboard';

export default function FretboardPage() {
  const {
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
    setVolume,
    clearSelection,
  } = useFretboard();

  return (
    <div className="space-y-6 p-4 md:p-6">
      <div>
        <h1 className="text-2xl font-bold tracking-tight">Guitar Fretboard</h1>
        <p className="text-sm text-muted-foreground mt-1">
          Explore scales, chords, and notes across the fretboard. Click any note to hear it played!
        </p>
      </div>

      <FretboardControls
        rootNote={rootNote}
        scaleKey={scaleKey}
        chordKey={chordKey}
        displayMode={displayMode}
        useFlats={useFlats}
        showAllNotes={showAllNotes}
        audioEnabled={audioEnabled}
        volume={volume}
        onRootChange={setRootNote}
        onScaleChange={setScaleKey}
        onChordChange={setChordKey}
        onModeChange={setDisplayMode}
        onToggleFlats={toggleFlats}
        onToggleAllNotes={toggleShowAllNotes}
        onToggleAudio={toggleAudio}
        onVolumeChange={setVolume}
        onClear={clearSelection}
      />

      <FretboardGrid
        fretboard={fretboard}
        highlightedNotes={highlightedNotes}
        useFlats={useFlats}
        showAllNotes={showAllNotes}
        audioEnabled={audioEnabled}
      />

      <FretboardInfo
        rootNote={rootNote}
        scaleKey={scaleKey}
        chordKey={chordKey}
        displayMode={displayMode}
        highlightedNotes={highlightedNotes}
        useFlats={useFlats}
      />
    </div>
  );
}
