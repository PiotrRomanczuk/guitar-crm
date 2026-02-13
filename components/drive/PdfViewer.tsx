'use client';

import { useState, useEffect } from 'react';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Download, Loader2, ExternalLink } from 'lucide-react';
import { formatBytes } from '@/lib/utils';
import type { DriveFile } from '@/types/DriveFile';

interface PdfViewerProps {
  file: DriveFile | null;
  onClose: () => void;
}

export default function PdfViewer({ file, onClose }: PdfViewerProps) {
  const [isLoading, setIsLoading] = useState(true);
  const [streamUrl, setStreamUrl] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);

  // Fetch stream URL when file changes
  useEffect(() => {
    if (!file) {
      queueMicrotask(() => {
        setStreamUrl(null);
        setError(null);
      });
      return;
    }

    queueMicrotask(() => {
      setIsLoading(true);
      setError(null);
    });

    fetch(`/api/drive/files/${file.id}/stream`)
      .then((res) => res.json())
      .then((data) => {
        setStreamUrl(data.streamUrl);
        setIsLoading(false);
      })
      .catch((err) => {
        console.error('Failed to load PDF stream', err);
        setError('Failed to load PDF. Please try again later.');
        setIsLoading(false);
      });
  }, [file]);

  const handleDownload = () => {
    if (!streamUrl) return;

    const link = document.createElement('a');
    link.href = streamUrl;
    link.download = file?.filename || 'document.pdf';
    link.click();
  };

  const handleOpenInNewTab = () => {
    if (!streamUrl) return;
    window.open(streamUrl, '_blank');
  };

  if (!file) return null;

  return (
    <Dialog open={!!file} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-4xl h-[90vh] flex flex-col">
        <DialogHeader>
          <div className="flex items-center justify-between">
            <div className="flex-1 min-w-0">
              <DialogTitle className="line-clamp-1">{file.title || file.filename}</DialogTitle>
              {file.description && (
                <p className="text-sm text-muted-foreground mt-1">{file.description}</p>
              )}
            </div>
            <div className="flex items-center gap-2 ml-4">
              <Button
                variant="outline"
                size="sm"
                onClick={handleOpenInNewTab}
                disabled={!streamUrl || isLoading}
              >
                <ExternalLink className="h-4 w-4 mr-2" />
                Open
              </Button>
              <Button
                variant="outline"
                size="sm"
                onClick={handleDownload}
                disabled={!streamUrl || isLoading}
              >
                <Download className="h-4 w-4 mr-2" />
                Download
              </Button>
            </div>
          </div>
        </DialogHeader>

        <div className="flex-1 min-h-0 relative">
          {/* Loading State */}
          {isLoading && (
            <div className="absolute inset-0 flex items-center justify-center bg-muted/50">
              <div className="text-center">
                <Loader2 className="h-8 w-8 animate-spin text-muted-foreground mx-auto mb-2" />
                <p className="text-sm text-muted-foreground">Loading PDF...</p>
              </div>
            </div>
          )}

          {/* Error State */}
          {error && (
            <div className="absolute inset-0 flex items-center justify-center">
              <div className="text-center text-destructive">
                <p className="font-medium">{error}</p>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={handleDownload}
                  disabled={!streamUrl}
                  className="mt-4"
                >
                  <Download className="h-4 w-4 mr-2" />
                  Download Instead
                </Button>
              </div>
            </div>
          )}

          {/* PDF Embed */}
          {!isLoading && !error && streamUrl && (
            <iframe
              src={`${streamUrl}#toolbar=1&navpanes=0&scrollbar=1`}
              className="w-full h-full border-0 rounded-lg"
              title={file.title || file.filename}
            />
          )}
        </div>

        {/* File Info Footer */}
        <div className="pt-3 border-t flex justify-between text-xs text-muted-foreground">
          <span>PDF Document</span>
          {file.file_size_bytes && <span>{formatBytes(file.file_size_bytes)}</span>}
          {file.metadata && 'page_count' in file.metadata && file.metadata.page_count && (
            <span>{file.metadata.page_count} pages</span>
          )}
        </div>
      </DialogContent>
    </Dialog>
  );
}
