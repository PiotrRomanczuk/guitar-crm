'use client';

import { Palette } from 'lucide-react';
import { ToggleGroup, ToggleGroupItem } from '@/components/ui/toggle-group';
import { Button } from '@/components/ui/button';
import { type NoteDisplayType } from '../useFretboard';

interface ToggleButtonsProps {
  useFlats: boolean;
  showAllNotes: boolean;
  noteDisplayType: NoteDisplayType;
  showFunctionalColors: boolean;
  onToggleFlats: () => void;
  onToggleAllNotes: () => void;
  onNoteDisplayTypeChange: (type: NoteDisplayType) => void;
  onToggleFunctionalColors: () => void;
}

export function ToggleButtons({
  useFlats,
  showAllNotes,
  noteDisplayType,
  showFunctionalColors,
  onToggleFlats,
  onToggleAllNotes,
  onNoteDisplayTypeChange,
  onToggleFunctionalColors,
}: ToggleButtonsProps) {
  return (
    <div className="flex flex-wrap items-center gap-2 ml-auto">
      <ToggleGroup
        type="single"
        value={noteDisplayType}
        onValueChange={(value) => value && onNoteDisplayTypeChange(value as NoteDisplayType)}
        variant="outline"
        size="sm"
      >
        <ToggleGroupItem value="name">Notes</ToggleGroupItem>
        <ToggleGroupItem value="interval">Intervals</ToggleGroupItem>
      </ToggleGroup>

      <Button
        variant={showFunctionalColors ? 'default' : 'outline'}
        size="sm"
        onClick={onToggleFunctionalColors}
        title="Color notes by function (Root, 3rd, 5th, etc.)"
      >
        <Palette className="h-4 w-4 mr-1" />
        {showFunctionalColors ? 'Colors On' : 'Colors Off'}
      </Button>

      <div className="flex items-center gap-2 border-l border-border pl-2 ml-2">
        <Button
          variant={useFlats ? 'default' : 'outline'}
          size="sm"
          onClick={onToggleFlats}
        >
          {useFlats ? 'b Flats' : '# Sharps'}
        </Button>
        <Button
          variant={showAllNotes ? 'default' : 'outline'}
          size="sm"
          onClick={onToggleAllNotes}
        >
          {showAllNotes ? 'All Notes' : 'Scale Only'}
        </Button>
      </div>
    </div>
  );
}
