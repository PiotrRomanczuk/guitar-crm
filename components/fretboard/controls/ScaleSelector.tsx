'use client';

import { SCALE_DEFINITIONS } from '@/lib/music-theory/scales';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';

interface ScaleSelectorProps {
  scaleKey: string;
  onChange: (key: string) => void;
}

export function ScaleSelector({ scaleKey, onChange }: ScaleSelectorProps) {
  return (
    <div className="flex items-center gap-2">
      <label className="text-sm font-medium text-muted-foreground">Scale:</label>
      <Select value={scaleKey} onValueChange={onChange}>
        <SelectTrigger className="w-[180px]" size="sm">
          <SelectValue />
        </SelectTrigger>
        <SelectContent>
          {Object.entries(SCALE_DEFINITIONS).map(([key, def]) => (
            <SelectItem key={key} value={key}>
              {def.name}
            </SelectItem>
          ))}
        </SelectContent>
      </Select>
    </div>
  );
}
