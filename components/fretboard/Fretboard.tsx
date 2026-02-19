'use client';

import { TOTAL_FRETS, type NoteName } from '@/lib/music-theory';
import { NoteCell } from './Fretboard.NoteCell';
import { FRET_MARKERS, STRING_LABELS } from './fretboard.helpers';
import { type FretboardState } from './useFretboard';
import { useGuitarAudio } from './useGuitarAudio';
import { type CAGEDActiveShape } from './caged.helpers';

type FretboardGridProps = Pick<
  FretboardState,
  | 'fretboard'
  | 'highlightedNotes'
  | 'useFlats'
  | 'showAllNotes'
  | 'noteDisplayType'
  | 'showFunctionalColors'
  | 'rootNote'
  | 'activeNoteIndex'
> & {
  audioEnabled?: boolean;
  isTraining?: boolean;
  onSubmitNote?: (note: NoteName) => void;
  activeCAGEDShapes?: CAGEDActiveShape[];
};

export function FretboardGrid({
  fretboard,
  highlightedNotes,
  useFlats,
  showAllNotes,
  noteDisplayType,
  showFunctionalColors,
  rootNote,
  activeNoteIndex,
  audioEnabled = true,
  isTraining = false,
  onSubmitNote,
  activeCAGEDShapes = [],
}: FretboardGridProps) {
  const { playNote, isReady } = useGuitarAudio();
  const fretNumbers = Array.from({ length: TOTAL_FRETS + 1 }, (_, i) => i);
  // Reverse strings to show 1st string (high e) at top, 6th string (low E) at bottom
  const reversedFretboard = [...fretboard].reverse();
  const reversedLabels = [...STRING_LABELS].reverse();

  const handleNoteClick = async (displayStringIndex: number, fret: number, note: NoteName) => {
    if (onSubmitNote) {
      onSubmitNote(note);
    }

    if (!audioEnabled || !isReady) return;

    // Convert reversed display index back to original string index (0 = low E, 5 = high e)
    const actualStringIndex = 5 - displayStringIndex;
    await playNote(actualStringIndex, fret, note);
  };

  return (
    <div className="rounded-lg border border-border bg-card overflow-x-auto">
      <table className="border-collapse w-full min-w-[900px]">
        <thead>
          <FretNumberRow fretNumbers={fretNumbers} />
        </thead>
        <tbody>
          {reversedFretboard.map((stringNotes, displayStringIndex) => (
            <tr key={displayStringIndex} className="border-b border-border/30 last:border-b-0">
              <td className="px-2 py-1 text-xs text-muted-foreground whitespace-nowrap font-mono w-16 text-right border-r-2 border-foreground/20">
                {reversedLabels[displayStringIndex]}
              </td>
              {stringNotes.map((note, fret) => (
                <NoteCell
                  key={`${displayStringIndex}-${fret}`}
                  note={note}
                  fret={fret}
                  stringIndex={displayStringIndex}
                  highlightedNotes={highlightedNotes}
                  useFlats={useFlats}
                  showAllNotes={showAllNotes}
                  noteDisplayType={noteDisplayType}
                  showFunctionalColors={showFunctionalColors}
                  rootNote={rootNote}
                  isActive={activeNoteIndex !== null && highlightedNotes[activeNoteIndex] === note}
                  cagedLabel={activeCAGEDShapes
                    .filter((shape) =>
                      shape.cells.some((cell) => cell.stringIndex === displayStringIndex && cell.fret === fret)
                    )
                    .map((shape) => shape.name)
                    .join('/')}
                  onNoteClick={audioEnabled ? handleNoteClick : undefined}
                />
              ))}
            </tr>
          ))}
        </tbody>
        <tfoot>
          <FretMarkerRow fretNumbers={fretNumbers} />
        </tfoot>
      </table>
    </div>
  );
}

function FretNumberRow({ fretNumbers }: { fretNumbers: number[] }) {
  return (
    <tr className="border-b-2 border-foreground/20">
      <th className="w-16" />
      {fretNumbers.map((fret) => (
        <th
          key={fret}
          className={`text-center text-xs font-medium py-2 ${fret === 0
            ? 'text-foreground bg-muted/50 dark:bg-muted/30 w-12'
            : 'text-muted-foreground w-16'
            }`}
        >
          {fret === 0 ? 'Open' : fret}
        </th>
      ))}
    </tr>
  );
}

function FretMarkerRow({ fretNumbers }: { fretNumbers: number[] }) {
  return (
    <tr>
      <td className="w-16" />
      {fretNumbers.map((fret) => {
        const marker = FRET_MARKERS[fret];
        return (
          <td key={fret} className="text-center py-1">
            {marker === 'single' && (
              <div className="mx-auto w-2 h-2 rounded-full bg-muted-foreground/40" />
            )}
            {marker === 'double' && (
              <div className="flex justify-center gap-1">
                <div className="w-2 h-2 rounded-full bg-muted-foreground/40" />
                <div className="w-2 h-2 rounded-full bg-muted-foreground/40" />
              </div>
            )}
          </td>
        );
      })}
    </tr>
  );
}
