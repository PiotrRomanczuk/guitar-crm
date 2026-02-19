'use client';

import type { DriveFile } from '@/types/DriveFile';

interface AudioPlayerProps {
  file: DriveFile;
  onClose: () => void;
}

/**
 * Audio player component for drive files.
 * TODO: Implement full audio player with waveform visualization.
 */
export default function AudioPlayer({ file, onClose }: AudioPlayerProps) {
  const streamUrl = `/api/drive/files/${file.id}/stream`;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50">
      <div className="bg-card rounded-lg p-6 max-w-md w-full mx-4 shadow-xl">
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-sm font-medium truncate">
            {file.title || file.filename}
          </h3>
          <button
            onClick={onClose}
            className="text-muted-foreground hover:text-foreground text-sm"
            aria-label="Close audio player"
          >
            Close
          </button>
        </div>
        <audio
          src={streamUrl}
          controls
          autoPlay
          className="w-full"
        >
          <track kind="captions" />
        </audio>
      </div>
    </div>
  );
}
