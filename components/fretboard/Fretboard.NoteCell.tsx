'use client';

import { type NoteName } from '@/lib/music-theory';
import {
  getNoteColor,
  formatNoteDisplay,
  isHighlighted,
  isRoot,
} from './fretboard.helpers';

interface NoteCellProps {
  note: NoteName;
  fret: number;
  highlightedNotes: NoteName[];
  useFlats: boolean;
  showAllNotes: boolean;
}

export function NoteCell({
  note,
  fret,
  highlightedNotes,
  useFlats,
  showAllNotes,
}: NoteCellProps) {
  const highlighted = isHighlighted(note, highlightedNotes);
  const root = isRoot(note, highlightedNotes);
  const shouldShow = highlighted || showAllNotes || highlightedNotes.length === 0;
  const noteText = formatNoteDisplay(note, useFlats);

  return (
    <td
      className={`relative h-10 border-r border-border/40 ${
        fret === 0 ? 'bg-muted/50 dark:bg-muted/30 w-12' : 'w-16'
      }`}
    >
      {/* String line */}
      <div className="absolute inset-y-0 left-0 right-0 flex items-center">
        <div className="h-px w-full bg-foreground/30 dark:bg-foreground/20" />
      </div>

      {/* Note dot */}
      {shouldShow && (
        <div className="absolute inset-0 flex items-center justify-center z-10">
          <div
            className={`flex items-center justify-center rounded-full transition-all ${
              highlighted
                ? `${getNoteColor(note, highlightedNotes)} ${
                    root ? 'w-8 h-8 font-bold ring-2 ring-white/50 shadow-lg' : 'w-7 h-7 font-medium'
                  }`
                : 'w-6 h-6 bg-muted text-muted-foreground text-[10px]'
            }`}
          >
            <span className={highlighted ? 'text-xs' : 'text-[10px]'}>
              {noteText}
            </span>
          </div>
        </div>
      )}
    </td>
  );
}
