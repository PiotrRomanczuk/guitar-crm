'use client';

import { useState, useRef, useEffect } from 'react';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Slider } from '@/components/ui/slider';
import { Play, Pause, Volume2, VolumeX, Loader2 } from 'lucide-react';
import { formatBytes } from '@/lib/utils';
import type { DriveFile } from '@/types/DriveFile';

interface AudioPlayerProps {
  file: DriveFile | null;
  onClose: () => void;
}

export default function AudioPlayer({ file, onClose }: AudioPlayerProps) {
  const audioRef = useRef<HTMLAudioElement>(null);
  const [isPlaying, setIsPlaying] = useState(false);
  const [currentTime, setCurrentTime] = useState(0);
  const [duration, setDuration] = useState(0);
  const [volume, setVolume] = useState(1);
  const [isMuted, setIsMuted] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [streamUrl, setStreamUrl] = useState<string | null>(null);

  // Fetch stream URL when file changes
  useEffect(() => {
    if (!file) {
      queueMicrotask(() => setStreamUrl(null));
      return;
    }

    queueMicrotask(() => setIsLoading(true));
    fetch(`/api/drive/files/${file.id}/stream`)
      .then((res) => res.json())
      .then((data) => {
        setStreamUrl(data.streamUrl);
        setIsLoading(false);
      })
      .catch((err) => {
        console.error('Failed to load audio stream', err);
        setIsLoading(false);
      });
  }, [file]);

  // Reset state when file changes
  useEffect(() => {
    if (file) {
      queueMicrotask(() => {
        setIsPlaying(false);
        setCurrentTime(0);
      });
    }
  }, [file]);

  // Audio event handlers
  useEffect(() => {
    const audio = audioRef.current;
    if (!audio) return;

    const handleTimeUpdate = () => setCurrentTime(audio.currentTime);
    const handleDurationChange = () => setDuration(audio.duration);
    const handleEnded = () => setIsPlaying(false);
    const handleLoadedData = () => setIsLoading(false);

    audio.addEventListener('timeupdate', handleTimeUpdate);
    audio.addEventListener('durationchange', handleDurationChange);
    audio.addEventListener('ended', handleEnded);
    audio.addEventListener('loadeddata', handleLoadedData);

    return () => {
      audio.removeEventListener('timeupdate', handleTimeUpdate);
      audio.removeEventListener('durationchange', handleDurationChange);
      audio.removeEventListener('ended', handleEnded);
      audio.removeEventListener('loadeddata', handleLoadedData);
    };
  }, []);

  const togglePlay = () => {
    const audio = audioRef.current;
    if (!audio) return;

    if (isPlaying) {
      audio.pause();
    } else {
      audio.play();
    }
    setIsPlaying(!isPlaying);
  };

  const handleSeek = (value: number[]) => {
    const audio = audioRef.current;
    if (!audio) return;
    audio.currentTime = value[0];
    setCurrentTime(value[0]);
  };

  const handleVolumeChange = (value: number[]) => {
    const audio = audioRef.current;
    if (!audio) return;
    const newVolume = value[0];
    audio.volume = newVolume;
    setVolume(newVolume);
    setIsMuted(newVolume === 0);
  };

  const toggleMute = () => {
    const audio = audioRef.current;
    if (!audio) return;

    if (isMuted) {
      audio.volume = volume || 0.5;
      setIsMuted(false);
    } else {
      audio.volume = 0;
      setIsMuted(true);
    }
  };

  const formatTime = (seconds: number) => {
    if (!isFinite(seconds)) return '0:00';
    const mins = Math.floor(seconds / 60);
    const secs = Math.floor(seconds % 60);
    return `${mins}:${secs.toString().padStart(2, '0')}`;
  };

  if (!file) return null;

  return (
    <Dialog open={!!file} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-2xl">
        <DialogHeader>
          <DialogTitle>{file.title || file.filename}</DialogTitle>
          {file.description && (
            <p className="text-sm text-muted-foreground">{file.description}</p>
          )}
        </DialogHeader>

        <div className="space-y-4 py-4">
          {/* Hidden audio element */}
          {streamUrl && (
            <audio ref={audioRef} src={streamUrl} preload="metadata" />
          )}

          {/* Loading State */}
          {isLoading && (
            <div className="flex items-center justify-center py-8">
              <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
            </div>
          )}

          {/* Player Controls */}
          {!isLoading && streamUrl && (
            <>
              {/* Progress Bar */}
              <div className="space-y-2">
                <Slider
                  value={[currentTime]}
                  max={duration || 100}
                  step={0.1}
                  onValueChange={handleSeek}
                  className="w-full"
                />
                <div className="flex justify-between text-xs text-muted-foreground">
                  <span>{formatTime(currentTime)}</span>
                  <span>{formatTime(duration)}</span>
                </div>
              </div>

              {/* Play/Pause Button */}
              <div className="flex items-center justify-center gap-4">
                <Button
                  size="lg"
                  onClick={togglePlay}
                  className="h-14 w-14 rounded-full"
                >
                  {isPlaying ? (
                    <Pause className="h-6 w-6" />
                  ) : (
                    <Play className="h-6 w-6 ml-1" />
                  )}
                </Button>
              </div>

              {/* Volume Control */}
              <div className="flex items-center gap-3">
                <Button
                  variant="ghost"
                  size="icon"
                  onClick={toggleMute}
                  className="shrink-0"
                >
                  {isMuted || volume === 0 ? (
                    <VolumeX className="h-4 w-4" />
                  ) : (
                    <Volume2 className="h-4 w-4" />
                  )}
                </Button>
                <Slider
                  value={[isMuted ? 0 : volume]}
                  max={1}
                  step={0.01}
                  onValueChange={handleVolumeChange}
                  className="w-24"
                />
              </div>

              {/* File Info */}
              <div className="pt-4 border-t space-y-1 text-sm text-muted-foreground">
                <div className="flex justify-between">
                  <span>Format:</span>
                  <span className="font-medium">{file.mime_type}</span>
                </div>
                {file.file_size_bytes && (
                  <div className="flex justify-between">
                    <span>Size:</span>
                    <span className="font-medium">{formatBytes(file.file_size_bytes)}</span>
                  </div>
                )}
              </div>
            </>
          )}

          {!isLoading && !streamUrl && (
            <div className="text-center py-8 text-destructive">
              Failed to load audio. Please try again later.
            </div>
          )}
        </div>
      </DialogContent>
    </Dialog>
  );
}
