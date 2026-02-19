'use client';

import { useEffect, useState, useCallback } from 'react';
import { Dialog, DialogContent, DialogTitle } from '@/components/ui/dialog';
import { Loader2 } from 'lucide-react';
import dynamic from 'next/dynamic';
import type { SongVideo } from '@/types/SongVideo';

const ReactPlayer = dynamic(() => import('react-player'), { ssr: false }) as any;

interface VideoPlayerProps {
  video: SongVideo | null;
  songId: string;
  onClose: () => void;
}

export default function VideoPlayer({ video, songId, onClose }: VideoPlayerProps) {
  const [streamUrl, setStreamUrl] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const fetchStreamUrl = useCallback(async () => {
    if (!video) return;

    setIsLoading(true);
    setError(null);

    try {
      const res = await fetch(`/api/song/${songId}/videos/${video.id}/stream`);
      if (!res.ok) throw new Error('Failed to load video');
      const data = await res.json();
      setStreamUrl(data.url);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to load video');
    } finally {
      setIsLoading(false);
    }
  }, [video, songId]);

  useEffect(() => {
    if (video) {
      fetchStreamUrl();
    } else {
      setStreamUrl(null);
      setError(null);
    }
  }, [video, fetchStreamUrl]);

  // Keyboard controls
  useEffect(() => {
    if (!video) return;

    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') onClose();
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [video, onClose]);

  return (
    <Dialog open={!!video} onOpenChange={(open) => !open && onClose()}>
      <DialogContent className="max-w-4xl w-full p-0 bg-black border-none overflow-hidden">
        <DialogTitle className="sr-only">
          {video?.title || video?.filename || 'Video Player'}
        </DialogTitle>

        <div className="relative w-full aspect-video flex items-center justify-center">
          {isLoading && (
            <Loader2 className="h-10 w-10 animate-spin text-white" />
          )}

          {error && (
            <div className="text-center text-white p-4">
              <p className="text-sm">{error}</p>
            </div>
          )}

          {streamUrl && !isLoading && !error && (
            <ReactPlayer
              url={streamUrl}
              controls
              playing
              width="100%"
              height="100%"
              playsinline
            />
          )}
        </div>

        {video && (
          <div className="px-4 py-3 bg-card border-t border-border">
            <p className="text-sm font-medium truncate">
              {video.title || video.filename}
            </p>
          </div>
        )}
      </DialogContent>
    </Dialog>
  );
}
