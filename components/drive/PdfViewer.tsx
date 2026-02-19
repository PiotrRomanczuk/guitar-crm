'use client';

import type { DriveFile } from '@/types/DriveFile';

interface PdfViewerProps {
  file: DriveFile;
  onClose: () => void;
}

/**
 * PDF viewer component for drive files.
 * TODO: Implement full PDF viewer with page navigation.
 */
export default function PdfViewer({ file, onClose }: PdfViewerProps) {
  const streamUrl = `/api/drive/files/${file.id}/stream`;

  return (
    <div className="fixed inset-0 z-50 flex flex-col bg-black/50">
      <div className="flex items-center justify-between bg-card px-4 py-2 border-b">
        <h3 className="text-sm font-medium truncate">
          {file.title || file.filename}
        </h3>
        <button
          onClick={onClose}
          className="text-muted-foreground hover:text-foreground text-sm"
          aria-label="Close PDF viewer"
        >
          Close
        </button>
      </div>
      <div className="flex-1">
        <iframe
          src={streamUrl}
          className="w-full h-full"
          title={file.title || file.filename}
        />
      </div>
    </div>
  );
}
