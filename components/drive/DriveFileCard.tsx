'use client';

import { useState } from 'react';
import { Button } from '@/components/ui/button';
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import {
  FileAudio,
  FileText,
  FileVideo,
  Image as ImageIcon,
  File as FileIcon,
  Play,
  Download,
  Trash2,
  MoreVertical,
  Eye,
} from 'lucide-react';
import { cn, formatBytes } from '@/lib/utils';
import type { DriveFile, FileType } from '@/types/DriveFile';

const FILE_TYPE_ICONS: Record<FileType, React.ComponentType<{ className?: string }>> = {
  audio: FileAudio,
  pdf: FileText,
  video: FileVideo,
  image: ImageIcon,
  document: FileIcon,
};

const FILE_TYPE_COLORS: Record<FileType, string> = {
  audio: 'text-purple-500',
  pdf: 'text-red-500',
  video: 'text-blue-500',
  image: 'text-green-500',
  document: 'text-orange-500',
};

interface DriveFileCardProps {
  file: DriveFile;
  isTeacher?: boolean;
  onPlay?: (file: DriveFile) => void;
  onPreview?: (file: DriveFile) => void;
  onDelete?: (file: DriveFile) => void;
  isDeleting?: boolean;
}

export default function DriveFileCard({
  file,
  isTeacher = false,
  onPlay,
  onPreview,
  onDelete,
  isDeleting = false,
}: DriveFileCardProps) {
  const [imageError, setImageError] = useState(false);
  const Icon = FILE_TYPE_ICONS[file.file_type];
  const iconColor = FILE_TYPE_COLORS[file.file_type];

  const thumbnailUrl =
    (file.file_type === 'video' || file.file_type === 'image') &&
    file.metadata &&
    'thumbnail_url' in file.metadata &&
    typeof file.metadata.thumbnail_url === 'string'
      ? file.metadata.thumbnail_url
      : null;

  const showThumbnail = thumbnailUrl !== null && !imageError;

  const handleAction = () => {
    if (file.file_type === 'audio' || file.file_type === 'video') {
      onPlay?.(file);
    } else {
      onPreview?.(file);
    }
  };

  const formatDuration = (seconds?: number) => {
    if (!seconds) return null;
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins}:${secs.toString().padStart(2, '0')}`;
  };

  const duration =
    (file.file_type === 'audio' || file.file_type === 'video') &&
    file.metadata &&
    'duration_seconds' in file.metadata &&
    typeof file.metadata.duration_seconds === 'number'
      ? formatDuration(file.metadata.duration_seconds)
      : null;

  return (
    <Card className="group overflow-hidden hover:shadow-md transition-shadow">
      <div
        className={cn(
          'relative aspect-video bg-muted flex items-center justify-center cursor-pointer',
          showThumbnail && 'p-0'
        )}
        onClick={handleAction}
      >
        {showThumbnail ? (
          <img
            src={thumbnailUrl}
            alt={file.title || file.filename}
            className="w-full h-full object-cover"
            onError={() => setImageError(true)}
          />
        ) : (
          <Icon className={cn('w-12 h-12', iconColor)} />
        )}

        {/* Play/Preview Overlay */}
        <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
          {file.file_type === 'audio' || file.file_type === 'video' ? (
            <Play className="w-12 h-12 text-white drop-shadow-lg" />
          ) : (
            <Eye className="w-12 h-12 text-white drop-shadow-lg" />
          )}
        </div>

        {/* Duration Badge */}
        {duration && (
          <div className="absolute bottom-2 right-2 bg-black/70 text-white text-xs px-2 py-1 rounded">
            {duration}
          </div>
        )}
      </div>

      <CardHeader className="p-3 pb-2">
        <div className="flex items-start justify-between gap-2">
          <div className="flex-1 min-w-0">
            <CardTitle className="text-sm line-clamp-1" title={file.title || file.filename}>
              {file.title || file.filename}
            </CardTitle>
            {file.description && (
              <CardDescription className="text-xs line-clamp-2 mt-1">
                {file.description}
              </CardDescription>
            )}
          </div>

          {isTeacher && (
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant="ghost" size="icon" className="h-7 w-7 shrink-0">
                  <MoreVertical className="h-4 w-4" />
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end">
                <DropdownMenuItem onClick={handleAction}>
                  <Eye className="h-4 w-4 mr-2" />
                  Preview
                </DropdownMenuItem>
                <DropdownMenuItem
                  onClick={() => {
                    const link = document.createElement('a');
                    link.href = `/api/drive/files/${file.id}/stream`;
                    link.download = file.filename;
                    link.click();
                  }}
                >
                  <Download className="h-4 w-4 mr-2" />
                  Download
                </DropdownMenuItem>
                <DropdownMenuItem
                  onClick={() => onDelete?.(file)}
                  disabled={isDeleting}
                  className="text-destructive focus:text-destructive"
                >
                  <Trash2 className="h-4 w-4 mr-2" />
                  {isDeleting ? 'Deleting...' : 'Delete'}
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          )}
        </div>
      </CardHeader>

      <CardContent className="p-3 pt-0">
        <div className="flex items-center justify-between text-xs text-muted-foreground">
          <span className="capitalize">{file.file_type}</span>
          {file.file_size_bytes && <span>{formatBytes(file.file_size_bytes)}</span>}
        </div>
      </CardContent>
    </Card>
  );
}
