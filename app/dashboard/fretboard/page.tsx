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
    noteDisplayType,
    showFunctionalColors,
    useFlats,
    showAllNotes,
    audioEnabled,
    volume,
    isPlaying,
    bpm,
    activeNoteIndex,
    isTraining,
    targetNote,
    score,
    trainingFeedback,
    highlightedNotes,
    fretboard,
    setRootNote,
    setScaleKey,
    setChordKey,
    setDisplayMode,
    setNoteDisplayType,
    toggleFunctionalColors,
    toggleFlats,
    toggleShowAllNotes,
    toggleAudio,
    togglePlayback,
    setBpm,
    startTraining,
    stopTraining,
    submitNote,
    cagedShape,
    activeCAGEDShapes,
    setCagedShape,
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
        noteDisplayType={noteDisplayType}
        showFunctionalColors={showFunctionalColors}
        isPlaying={isPlaying}
        bpm={bpm}
        useFlats={useFlats}
        showAllNotes={showAllNotes}
        audioEnabled={audioEnabled}
        volume={volume}
        onRootChange={setRootNote}
        onScaleChange={setScaleKey}
        onChordChange={setChordKey}
        onModeChange={setDisplayMode}
        onNoteDisplayTypeChange={setNoteDisplayType}
        onToggleFunctionalColors={toggleFunctionalColors}
        onTogglePlayback={togglePlayback}
        onBpmChange={setBpm}
        isTraining={isTraining}
        targetNote={targetNote}
        score={score}
        trainingFeedback={trainingFeedback}
        onStartTraining={startTraining}
        onStopTraining={stopTraining}
        cagedShape={cagedShape}
        onCagedShapeChange={setCagedShape}
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
        noteDisplayType={noteDisplayType}
        showFunctionalColors={showFunctionalColors}
        rootNote={rootNote}
        activeNoteIndex={activeNoteIndex}
        audioEnabled={audioEnabled}
        isTraining={isTraining}
        onSubmitNote={submitNote}
        activeCAGEDShapes={activeCAGEDShapes}
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
