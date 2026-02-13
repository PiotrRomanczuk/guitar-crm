'use client';

import { useState, useCallback } from 'react';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import { toast } from 'sonner';

interface UploadState {
  isUploading: boolean;
  progress: number;
  error: string | null;
}

interface UseVideoUploadOptions {
  songId: string;
  onSuccess?: () => void;
}

async function requestUploadUrl(
  songId: string,
  file: { filename: string; mime_type: string; file_size_bytes: number }
) {
  const res = await fetch(`/api/song/${songId}/videos/upload-url`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(file),
  });
  if (!res.ok) {
    const data = await res.json();
    throw new Error(data.error || 'Failed to get upload URL');
  }
  return res.json() as Promise<{ uploadUrl: string; folderId: string }>;
}

function uploadToDrive(
  uploadUrl: string,
  file: File,
  onProgress: (pct: number) => void
): Promise<string> {
  return new Promise((resolve, reject) => {
    const xhr = new XMLHttpRequest();
    xhr.open('PUT', uploadUrl, true);
    xhr.setRequestHeader('Content-Type', file.type);

    xhr.upload.onprogress = (e) => {
      if (e.lengthComputable) {
        onProgress(Math.round((e.loaded / e.total) * 100));
      }
    };

    xhr.onload = () => {
      if (xhr.status >= 200 && xhr.status < 300) {
        try {
          const response = JSON.parse(xhr.responseText);
          resolve(response.id);
        } catch {
          reject(new Error('Invalid response from Drive'));
        }
      } else {
        reject(new Error(`Upload failed with status ${xhr.status}`));
      }
    };

    xhr.onerror = () => reject(new Error('Network error during upload'));
    xhr.send(file);
  });
}

async function registerVideo(
  songId: string,
  data: {
    google_drive_file_id: string;
    filename: string;
    mime_type: string;
    file_size_bytes: number;
    title: string;
  }
) {
  const res = await fetch(`/api/song/${songId}/videos`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(data),
  });
  if (!res.ok) {
    const errData = await res.json();
    throw new Error(errData.error || 'Failed to register video');
  }
  return res.json();
}

export function useVideoUpload({ songId, onSuccess }: UseVideoUploadOptions) {
  const queryClient = useQueryClient();
  const [uploadState, setUploadState] = useState<UploadState>({
    isUploading: false,
    progress: 0,
    error: null,
  });

  const mutation = useMutation({
    mutationFn: async (file: File) => {
      setUploadState({ isUploading: true, progress: 0, error: null });

      // Step 1: Get resumable upload URL
      const { uploadUrl } = await requestUploadUrl(songId, {
        filename: file.name,
        mime_type: file.type,
        file_size_bytes: file.size,
      });

      // Step 2: Upload directly to Google Drive
      const driveFileId = await uploadToDrive(uploadUrl, file, (pct) => {
        setUploadState((prev) => ({ ...prev, progress: pct }));
      });

      // Step 3: Register metadata in our DB
      await registerVideo(songId, {
        google_drive_file_id: driveFileId,
        filename: file.name,
        mime_type: file.type,
        file_size_bytes: file.size,
        title: file.name.replace(/\.[^.]+$/, ''),
      });
    },
    onSuccess: () => {
      setUploadState({ isUploading: false, progress: 100, error: null });
      queryClient.invalidateQueries({ queryKey: ['song-videos', songId] });
      toast.success('Video uploaded successfully');
      onSuccess?.();
    },
    onError: (error: Error) => {
      setUploadState({ isUploading: false, progress: 0, error: error.message });
      toast.error(error.message || 'Failed to upload video');
    },
  });

  const upload = useCallback(
    (file: File) => mutation.mutate(file),
    [mutation]
  );

  return { ...uploadState, upload };
}
