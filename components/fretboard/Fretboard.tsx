'use client';

import { TOTAL_FRETS } from '@/lib/music-theory';
import { NoteCell } from './Fretboard.NoteCell';
import { FRET_MARKERS, STRING_LABELS } from './fretboard.helpers';
import { type FretboardState } from './useFretboard';

type FretboardGridProps = Pick<
  FretboardState,
  'fretboard' | 'highlightedNotes' | 'useFlats' | 'showAllNotes'
>;

export function FretboardGrid({
  fretboard,
  highlightedNotes,
  useFlats,
  showAllNotes,
}: FretboardGridProps) {
  const fretNumbers = Array.from({ length: TOTAL_FRETS + 1 }, (_, i) => i);

  return (
    <div className="rounded-lg border border-border bg-card overflow-x-auto">
      <table className="border-collapse w-full min-w-[900px]">
        <thead>
          <FretNumberRow fretNumbers={fretNumbers} />
        </thead>
        <tbody>
          {fretboard.map((stringNotes, stringIndex) => (
            <tr key={stringIndex} className="border-b border-border/30 last:border-b-0">
              <td className="px-2 py-1 text-xs text-muted-foreground whitespace-nowrap font-mono w-16 text-right border-r-2 border-foreground/20">
                {STRING_LABELS[stringIndex]}
              </td>
              {stringNotes.map((note, fret) => (
                <NoteCell
                  key={`${stringIndex}-${fret}`}
                  note={note}
                  fret={fret}
                  highlightedNotes={highlightedNotes}
                  useFlats={useFlats}
                  showAllNotes={showAllNotes}
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
          className={`text-center text-xs font-medium py-2 ${
            fret === 0
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
