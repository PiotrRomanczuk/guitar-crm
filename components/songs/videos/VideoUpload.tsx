'use client';

import { useRef, useState, useCallback } from 'react';
import { Button } from '@/components/ui/button';
import { Label } from '@/components/ui/label';
import { Progress } from '@/components/ui/progress';
import { Upload, Loader2, AlertCircle } from 'lucide-react';
import { useVideoUpload } from './hooks/useVideoUpload';
import { cn } from '@/lib/utils';

const ALLOWED_TYPES = ['video/mp4', 'video/quicktime', 'video/webm'];
const MAX_SIZE_MB = 500;
const MAX_SIZE_BYTES = MAX_SIZE_MB * 1024 * 1024;

interface VideoUploadProps {
  songId: string;
  onSuccess?: () => void;
  className?: string;
}

export default function VideoUpload({ songId, onSuccess, className }: VideoUploadProps) {
  const inputRef = useRef<HTMLInputElement>(null);
  const [dragActive, setDragActive] = useState(false);
  const [validationError, setValidationError] = useState<string | null>(null);
  const { isUploading, progress, error, upload } = useVideoUpload({ songId, onSuccess });

  const validateAndUpload = useCallback(
    (file: File) => {
      setValidationError(null);

      if (!ALLOWED_TYPES.includes(file.type)) {
        setValidationError('Please select an MP4, MOV, or WebM video file.');
        return;
      }

      if (file.size > MAX_SIZE_BYTES) {
        setValidationError(`File too large. Maximum size is ${MAX_SIZE_MB}MB.`);
        return;
      }

      upload(file);
    },
    [upload]
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
          htmlFor="video-upload"
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
              {isUploading ? 'Uploading...' : 'Drop a video or tap to select'}
            </p>
            <p className="text-xs text-muted-foreground/70 mt-1">
              MP4, MOV, or WebM up to {MAX_SIZE_MB}MB
            </p>
          </div>
          <input
            ref={inputRef}
            id="video-upload"
            type="file"
            accept="video/mp4,video/quicktime,video/webm"
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
        {isUploading ? 'Uploading...' : 'Select Video'}
      </Button>
    </div>
  );
}
