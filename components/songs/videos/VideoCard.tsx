'use client';

import { Button } from '@/components/ui/button';
import { Play, Trash2, Clock, HardDrive } from 'lucide-react';
import type { SongVideo } from '@/types/SongVideo';
import { cn } from '@/lib/utils';

interface VideoCardProps {
  video: SongVideo;
  isTeacher: boolean;
  onPlay: (video: SongVideo) => void;
  onDelete: (video: SongVideo) => void;
}

function formatDuration(seconds: number | null): string {
  if (!seconds) return '';
  const m = Math.floor(seconds / 60);
  const s = Math.round(seconds % 60);
  return `${m}:${String(s).padStart(2, '0')}`;
}

function formatFileSize(bytes: number | null): string {
  if (!bytes) return '';
  if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(0)} KB`;
  return `${(bytes / (1024 * 1024)).toFixed(1)} MB`;
}

export default function VideoCard({ video, isTeacher, onPlay, onDelete }: VideoCardProps) {
  return (
    <div className="group relative rounded-lg border border-border overflow-hidden bg-card">
      {/* Thumbnail / Play area */}
      <button
        type="button"
        onClick={() => onPlay(video)}
        className={cn(
          'relative w-full aspect-video bg-muted/50 flex items-center justify-center',
          'hover:bg-muted transition-colors cursor-pointer'
        )}
      >
        {video.thumbnail_url ? (
          // eslint-disable-next-line @next/next/no-img-element
          <img
            src={video.thumbnail_url}
            alt={video.title || video.filename}
            className="w-full h-full object-cover"
          />
        ) : (
          <div className="flex items-center justify-center w-full h-full bg-muted/30">
            <Play className="h-10 w-10 text-muted-foreground/50" />
          </div>
        )}

        {/* Play overlay */}
        <div className="absolute inset-0 flex items-center justify-center bg-black/0 group-hover:bg-black/20 transition-colors">
          <div className="h-12 w-12 rounded-full bg-primary/90 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity">
            <Play className="h-5 w-5 text-primary-foreground ml-0.5" fill="currentColor" />
          </div>
        </div>

        {/* Duration badge */}
        {video.duration_seconds ? (
          <span className="absolute bottom-2 right-2 bg-black/70 text-white text-xs px-1.5 py-0.5 rounded">
            {formatDuration(video.duration_seconds)}
          </span>
        ) : null}
      </button>

      {/* Info */}
      <div className="p-3 space-y-1">
        <p className="text-sm font-medium truncate" title={video.title || video.filename}>
          {video.title || video.filename}
        </p>
        <div className="flex items-center gap-3 text-xs text-muted-foreground">
          {video.duration_seconds ? (
            <span className="flex items-center gap-1">
              <Clock className="h-3 w-3" />
              {formatDuration(video.duration_seconds)}
            </span>
          ) : null}
          {video.file_size_bytes ? (
            <span className="flex items-center gap-1">
              <HardDrive className="h-3 w-3" />
              {formatFileSize(video.file_size_bytes)}
            </span>
          ) : null}
        </div>
      </div>

      {/* Delete button (teacher only) */}
      {isTeacher && (
        <Button
          type="button"
          variant="destructive"
          size="icon"
          className="absolute top-2 right-2 h-7 w-7 opacity-0 group-hover:opacity-100 transition-opacity"
          onClick={(e) => {
            e.stopPropagation();
            onDelete(video);
          }}
        >
          <Trash2 className="h-3.5 w-3.5" />
        </Button>
      )}
    </div>
  );
}
