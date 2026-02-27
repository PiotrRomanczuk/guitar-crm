'use client';

import { ToggleGroup, ToggleGroupItem } from '@/components/ui/toggle-group';
import { type CAGEDShape } from '../caged.helpers';

interface CagedSelectorProps {
  value: CAGEDShape | 'all' | 'none';
  onChange: (value: CAGEDShape | 'all' | 'none') => void;
}

export function CagedSelector({ value, onChange }: CagedSelectorProps) {
  return (
    <div className="flex items-center gap-2">
      <label className="text-sm font-medium text-muted-foreground mr-1">CAGED:</label>
      <ToggleGroup
        type="single"
        value={value}
        onValueChange={(val) => val && onChange(val as CAGEDShape | 'all' | 'none')}
        variant="outline"
        size="sm"
      >
        <ToggleGroupItem value="none">None</ToggleGroupItem>
        <ToggleGroupItem value="C">C</ToggleGroupItem>
        <ToggleGroupItem value="A">A</ToggleGroupItem>
        <ToggleGroupItem value="G">G</ToggleGroupItem>
        <ToggleGroupItem value="E">E</ToggleGroupItem>
        <ToggleGroupItem value="D">D</ToggleGroupItem>
        <ToggleGroupItem value="all">All</ToggleGroupItem>
      </ToggleGroup>
    </div>
  );
}
