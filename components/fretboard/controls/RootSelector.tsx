'use client';

import { CHROMATIC_NOTES, type NoteName } from '@/lib/music-theory';
import { formatNoteDisplay } from '../fretboard.helpers';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';

interface RootSelectorProps {
  rootNote: NoteName;
  useFlats: boolean;
  onChange: (note: NoteName) => void;
}

export function RootSelector({ rootNote, useFlats, onChange }: RootSelectorProps) {
  return (
    <div className="flex items-center gap-2">
      <label className="text-sm font-medium text-muted-foreground">Root:</label>
      <Select value={rootNote} onValueChange={(value) => onChange(value as NoteName)}>
        <SelectTrigger className="w-[100px]" size="sm">
          <SelectValue />
        </SelectTrigger>
        <SelectContent>
          {CHROMATIC_NOTES.map((note) => (
            <SelectItem key={note} value={note}>
              {formatNoteDisplay(note, useFlats)}
            </SelectItem>
          ))}
        </SelectContent>
      </Select>
    </div>
  );
}
