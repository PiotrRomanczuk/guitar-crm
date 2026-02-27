'use client';

import { CHORD_DEFINITIONS } from '@/lib/music-theory/chords';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';

interface ChordSelectorProps {
  chordKey: string;
  onChange: (key: string) => void;
}

export function ChordSelector({ chordKey, onChange }: ChordSelectorProps) {
  return (
    <div className="flex items-center gap-2">
      <label className="text-sm font-medium text-muted-foreground">Chord:</label>
      <Select value={chordKey} onValueChange={onChange}>
        <SelectTrigger className="w-[180px]" size="sm">
          <SelectValue />
        </SelectTrigger>
        <SelectContent>
          {Object.entries(CHORD_DEFINITIONS).map(([key, def]) => (
            <SelectItem key={key} value={key}>
              {def.name}
            </SelectItem>
          ))}
        </SelectContent>
      </Select>
    </div>
  );
}
