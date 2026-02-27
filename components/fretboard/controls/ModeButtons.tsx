'use client';

import { ToggleGroup, ToggleGroupItem } from '@/components/ui/toggle-group';
import { Button } from '@/components/ui/button';
import { type DisplayMode } from '../useFretboard';

interface ModeButtonsProps {
  displayMode: DisplayMode;
  onModeChange: (mode: DisplayMode) => void;
  onClear: () => void;
}

export function ModeButtons({ displayMode, onModeChange, onClear }: ModeButtonsProps) {
  return (
    <div className="flex items-center gap-2">
      <ToggleGroup
        type="single"
        value={displayMode}
        onValueChange={(value) => value && onModeChange(value as DisplayMode)}
        variant="outline"
      >
        <ToggleGroupItem value="scale" aria-label="Show scales">
          Scales
        </ToggleGroupItem>
        <ToggleGroupItem value="chord" aria-label="Show chords">
          Chords
        </ToggleGroupItem>
      </ToggleGroup>
      <Button
        variant="ghost"
        size="sm"
        onClick={onClear}
        className="text-muted-foreground"
      >
        Clear
      </Button>
    </div>
  );
}
