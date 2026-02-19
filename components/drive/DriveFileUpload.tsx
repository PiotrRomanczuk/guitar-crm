'use client';

import { useRef, useState, useCallback } from 'react';
import { Button } from '@/components/ui/button';
import { Label } from '@/components/ui/label';
import { Progress } from '@/components/ui/progress';
import { Upload, Loader2, AlertCircle } from 'lucide-react';
import { useDriveFileUpload } from './hooks/useDriveFileUpload';
import { cn } from '@/lib/utils';
import type { EntityType, FileType } from '@/types/DriveFile';

// File type configurations
const FILE_TYPE_CONFIG: Record<
  FileType,
  {
    accept: string[];
    label: string;
    maxSizeMB: number;
  }
> = {
  audio: {
    accept: ['audio/mpeg', 'audio/mp3', 'audio/wav', 'audio/ogg', 'audio/m4a'],
    label: 'MP3, WAV, OGG, or M4A',
    maxSizeMB: 100,
  },
  pdf: {
    accept: ['application/pdf'],
    label: 'PDF',
    maxSizeMB: 50,
  },
  video: {
    accept: ['video/mp4', 'video/quicktime', 'video/webm'],
    label: 'MP4, MOV, or WebM',
    maxSizeMB: 500,
  },
  document: {
    accept: [
      'application/msword',
      'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
      'text/plain',
    ],
    label: 'DOC, DOCX, or TXT',
    maxSizeMB: 25,
  },
  image: {
    accept: ['image/jpeg', 'image/jpg', 'image/png', 'image/webp'],
    label: 'JPG, PNG, or WebP',
    maxSizeMB: 10,
  },
};

interface DriveFileUploadProps {
  entityType: EntityType;
  entityId: string;
  fileType: FileType;
  onSuccess?: () => void;
  className?: string;
}

export default function DriveFileUpload({
  entityType,
  entityId,
  fileType,
  onSuccess,
  className,
}: DriveFileUploadProps) {
  const inputRef = useRef<HTMLInputElement>(null);
  const [dragActive, setDragActive] = useState(false);
  const [validationError, setValidationError] = useState<string | null>(null);
  const { isUploading, progress, error, upload } = useDriveFileUpload({
    entityType,
    entityId,
    fileType,
    onSuccess,
  });

  const config = FILE_TYPE_CONFIG[fileType];
  const maxSizeBytes = config.maxSizeMB * 1024 * 1024;

  const validateAndUpload = useCallback(
    (file: File) => {
      setValidationError(null);

      if (!config.accept.includes(file.type)) {
        setValidationError(`Please select a ${config.label} file.`);
        return;
      }

      if (file.size > maxSizeBytes) {
        setValidationError(`File too large. Maximum size is ${config.maxSizeMB}MB.`);
        return;
      }

      upload(file);
    },
    [upload, config.accept, config.label, config.maxSizeMB, maxSizeBytes]
  );

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) validateAndUpload(file);
    e.target.value = '';
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    setDragActive(false);
    const file = e.dataTransfer.files?.[0];
    if (file) validateAndUpload(file);
  };

  const handleDrag = (e: React.DragEvent) => {
    e.preventDefault();
    setDragActive(e.type === 'dragenter' || e.type === 'dragover');
  };

  const displayError = validationError || error;

  return (
    <div className={cn('space-y-3', className)}>
      <div
        onDragEnter={handleDrag}
        onDragLeave={handleDrag}
        onDragOver={handleDrag}
        onDrop={handleDrop}
      >
        <Label
          htmlFor={`file-upload-${fileType}`}
          className={cn(
            'flex flex-col items-center justify-center w-full h-32',
            'border-2 border-dashed rounded-lg cursor-pointer',
            'hover:bg-accent/50 transition-colors',
            dragActive && 'border-primary bg-primary/5',
            isUploading && 'opacity-50 cursor-not-allowed'
          )}
        >
          <div className="flex flex-col items-center justify-center pt-5 pb-6">
            {isUploading ? (
              <Loader2 className="h-8 w-8 animate-spin text-muted-foreground mb-2" />
            ) : (
              <Upload className="h-8 w-8 text-muted-foreground mb-2" />
            )}
            <p className="text-sm text-muted-foreground">
              {isUploading ? 'Uploading...' : `Drop ${fileType} or tap to select`}
            </p>
            <p className="text-xs text-muted-foreground/70 mt-1">
              {config.label} up to {config.maxSizeMB}MB
            </p>
          </div>
          <input
            ref={inputRef}
            id={`file-upload-${fileType}`}
            type="file"
            accept={config.accept.join(',')}
            className="hidden"
            onChange={handleFileChange}
            disabled={isUploading}
          />
        </Label>
      </div>

      {isUploading && (
        <div className="space-y-1">
          <Progress value={progress} className="h-2" />
          <p className="text-xs text-muted-foreground text-center">{progress}%</p>
        </div>
      )}

      {displayError && (
        <div className="flex items-center gap-2 text-sm text-destructive">
          <AlertCircle className="h-4 w-4 shrink-0" />
          <span>{displayError}</span>
        </div>
      )}

      <Button
        type="button"
        variant="outline"
        size="sm"
        onClick={() => inputRef.current?.click()}
        disabled={isUploading}
        className="w-full min-h-[44px]"
      >
        <Upload className="h-4 w-4 mr-2" />
        {isUploading ? 'Uploading...' : `Select ${fileType.charAt(0).toUpperCase() + fileType.slice(1)}`}
      </Button>
    </div>
  );
}
