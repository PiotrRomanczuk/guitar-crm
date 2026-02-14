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
    highlightedNotes,
    fretboard,
    setRootNote,
    setScaleKey,
    setChordKey,
    setDisplayMode,
    toggleFlats,
    toggleShowAllNotes,
    clearSelection,
  } = useFretboard();

  return (
    <div className="space-y-6 p-4 md:p-6">
      <div>
        <h1 className="text-2xl font-bold tracking-tight">Guitar Fretboard</h1>
        <p className="text-sm text-muted-foreground mt-1">
          Explore scales, chords, and notes across the fretboard.
        </p>
      </div>

      <FretboardControls
        rootNote={rootNote}
        scaleKey={scaleKey}
        chordKey={chordKey}
        displayMode={displayMode}
        useFlats={useFlats}
        showAllNotes={showAllNotes}
        onRootChange={setRootNote}
        onScaleChange={setScaleKey}
        onChordChange={setChordKey}
        onModeChange={setDisplayMode}
        onToggleFlats={toggleFlats}
        onToggleAllNotes={toggleShowAllNotes}
        onClear={clearSelection}
      />

      <FretboardGrid
        fretboard={fretboard}
        highlightedNotes={highlightedNotes}
        useFlats={useFlats}
        showAllNotes={showAllNotes}
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
