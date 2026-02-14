'use client';

import { type NoteName, formatNote } from '@/lib/music-theory';
import { SCALE_DEFINITIONS } from '@/lib/music-theory/scales';
import { CHORD_DEFINITIONS, getChordDisplayName } from '@/lib/music-theory/chords';
import { type DisplayMode } from './useFretboard';
import { getNoteColor } from './fretboard.helpers';

interface FretboardInfoProps {
  rootNote: NoteName;
  scaleKey: string;
  chordKey: string;
  displayMode: DisplayMode;
  highlightedNotes: NoteName[];
  useFlats: boolean;
}

export function FretboardInfo({
  rootNote,
  scaleKey,
  chordKey,
  displayMode,
  highlightedNotes,
  useFlats,
}: FretboardInfoProps) {
  if (displayMode === 'none' || highlightedNotes.length === 0) {
    return (
      <div className="rounded-lg border border-border bg-card p-4">
        <p className="text-sm text-muted-foreground">
          Select a scale or chord to see notes highlighted on the fretboard.
        </p>
      </div>
    );
  }

  const title =
    displayMode === 'scale'
      ? `${formatNote(rootNote, useFlats)} ${SCALE_DEFINITIONS[scaleKey]?.name ?? scaleKey}`
      : getChordDisplayName(rootNote, chordKey);

  const description =
    displayMode === 'scale'
      ? SCALE_DEFINITIONS[scaleKey]?.description
      : CHORD_DEFINITIONS[chordKey]?.description;

  const degreeLabels =
    displayMode === 'scale'
      ? ['R', '2', '3', '4', '5', '6', '7', '8', '9', '10', '11', '12']
      : ['R', '3rd', '5th', '7th', '9th', '11th', '13th'];

  return (
    <div className="rounded-lg border border-border bg-card p-4 space-y-3">
      <div>
        <h3 className="text-lg font-semibold">{title}</h3>
        {description && (
          <p className="text-sm text-muted-foreground mt-1">{description}</p>
        )}
      </div>
      <div className="flex flex-wrap gap-2">
        {highlightedNotes.map((note, i) => (
          <div
            key={`${note}-${i}`}
            className={`inline-flex items-center gap-1.5 rounded-full px-3 py-1 text-sm ${getNoteColor(note, highlightedNotes)}`}
          >
            <span className="font-semibold">
              {formatNote(note, useFlats)}
            </span>
            <span className="opacity-75 text-xs">
              {degreeLabels[i] ?? `${i + 1}`}
            </span>
          </div>
        ))}
      </div>
    </div>
  );
}
