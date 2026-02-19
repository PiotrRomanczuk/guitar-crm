'use client';

import { useState } from 'react';
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
  stringIndex: number;
  highlightedNotes: NoteName[];
  useFlats: boolean;
  showAllNotes: boolean;
  onNoteClick?: (stringIndex: number, fret: number, note: NoteName) => void;
}

export function NoteCell({
  note,
  fret,
  stringIndex,
  highlightedNotes,
  useFlats,
  showAllNotes,
  onNoteClick,
}: NoteCellProps) {
  const [isPlaying, setIsPlaying] = useState(false);
  const highlighted = isHighlighted(note, highlightedNotes);
  const root = isRoot(note, highlightedNotes);
  const shouldShow = highlighted || showAllNotes || highlightedNotes.length === 0;
  const noteText = formatNoteDisplay(note, useFlats);

  const handleClick = async () => {
    if (!onNoteClick) return;

    setIsPlaying(true);
    await onNoteClick(stringIndex, fret, note);

    // Reset animation after a short delay
    setTimeout(() => setIsPlaying(false), 300);
  };

  return (
    <td
      className={`relative h-10 border-r border-border/40 ${
        fret === 0 ? 'bg-muted/50 dark:bg-muted/30 w-12' : 'w-16'
      } ${onNoteClick ? 'cursor-pointer hover:bg-accent/20 transition-colors' : ''}`}
      onClick={handleClick}
    >
      {/* String line */}
      <div className="absolute inset-y-0 left-0 right-0 flex items-center">
        <div className="h-px w-full bg-foreground/30 dark:bg-foreground/20" />
      </div>

      {/* Note dot */}
      {shouldShow && (
        <div className="absolute inset-0 flex items-center justify-center z-10">
          <div
            className={`flex items-center justify-center rounded-full transition-all duration-200 ${
              isPlaying ? 'scale-125' : 'scale-100'
            } ${
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
