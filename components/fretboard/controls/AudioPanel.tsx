'use client';

import { Volume2, VolumeX, Square, Play } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { VolumeControl, BpmControl } from './AudioSliders';

interface AudioPanelProps {
  isPlaying: boolean;
  bpm: number;
  onTogglePlayback: () => void;
  onBpmChange: (bpm: number) => void;
  volume?: number;
  onVolumeChange?: (volume: number) => void;
  audioEnabled?: boolean;
  onToggleAudio?: () => void;
}

export function AudioPanel({
  isPlaying,
  bpm,
  onTogglePlayback,
  onBpmChange,
  volume,
  onVolumeChange,
  audioEnabled,
  onToggleAudio,
}: AudioPanelProps) {
  if (volume === undefined && audioEnabled === undefined) return null;

  return (
    <div className="flex flex-wrap items-center gap-3 border-t border-border pt-3">
      {onToggleAudio !== undefined && audioEnabled !== undefined && (
        <Button
          variant={audioEnabled ? 'default' : 'outline'}
          size="sm"
          onClick={onToggleAudio}
        >
          {audioEnabled ? (
            <><Volume2 className="h-4 w-4 mr-1" /> Audio On</>
          ) : (
            <><VolumeX className="h-4 w-4 mr-1" /> Audio Off</>
          )}
        </Button>
      )}
      {volume !== undefined && onVolumeChange && (
        <VolumeControl volume={volume} onChange={onVolumeChange} />
      )}
      <div className="flex items-center gap-2 border-l border-border pl-3 ml-auto">
        <Button
          variant={isPlaying ? 'destructive' : 'default'}
          size="sm"
          onClick={onTogglePlayback}
          className="w-24"
        >
          {isPlaying ? (
            <><Square className="h-4 w-4 mr-1" /> Stop</>
          ) : (
            <><Play className="h-4 w-4 mr-1" /> Play</>
          )}
        </Button>
        <BpmControl bpm={bpm} onChange={onBpmChange} />
      </div>
    </div>
  );
}
