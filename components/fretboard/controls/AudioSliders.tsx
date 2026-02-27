'use client';

import { Slider } from '@/components/ui/slider';

interface VolumeControlProps {
  volume: number;
  onChange: (volume: number) => void;
}

export function VolumeControl({ volume, onChange }: VolumeControlProps) {
  const volumePercent = Math.round(((volume + 60) / 60) * 100);

  const handleChange = ([val]: number[]) => {
    const dB = (val / 100) * 60 - 60;
    onChange(dB);
  };

  return (
    <div className="flex items-center gap-2">
      <label className="text-sm font-medium text-muted-foreground">Volume:</label>
      <Slider
        value={[volumePercent]}
        onValueChange={handleChange}
        min={0}
        max={100}
        step={1}
        className="w-32"
      />
      <span className="text-xs text-muted-foreground w-10 text-right">{volumePercent}%</span>
    </div>
  );
}

interface BpmControlProps {
  bpm: number;
  onChange: (bpm: number) => void;
}

export function BpmControl({ bpm, onChange }: BpmControlProps) {
  return (
    <div className="flex items-center gap-2">
      <label className="text-sm font-medium text-muted-foreground">BPM:</label>
      <Slider
        value={[bpm]}
        onValueChange={([val]) => onChange(val)}
        min={40}
        max={240}
        step={1}
        className="w-24"
      />
      <span className="text-xs text-muted-foreground w-8 text-right font-mono">{bpm}</span>
    </div>
  );
}
