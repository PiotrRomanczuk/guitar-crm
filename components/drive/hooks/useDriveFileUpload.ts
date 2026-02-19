'use client';

import { useState, useCallback } from 'react';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import { toast } from 'sonner';
import type { EntityType, FileType } from '@/types/DriveFile';

interface UploadState {
  isUploading: boolean;
  progress: number;
  error: string | null;
}

interface UseDriveFileUploadOptions {
  entityType: EntityType;
  entityId: string;
  fileType: FileType;
  onSuccess?: () => void;
}

async function requestUploadUrl(
  entityType: EntityType,
  entityId: string,
  file: { filename: string; mime_type: string; file_size_bytes: number; file_type: FileType }
) {
  const res = await fetch('/api/drive/files/upload-url', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      entity_type: entityType,
      entity_id: entityId,
      ...file,
    }),
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

async function registerFile(data: {
  entity_type: EntityType;
  entity_id: string;
  google_drive_file_id: string;
  google_drive_folder_id: string;
  file_type: FileType;
  filename: string;
  mime_type: string;
  file_size_bytes: number;
  title: string;
  visibility: 'private' | 'students' | 'public';
}) {
  const res = await fetch('/api/drive/files', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(data),
  });
  if (!res.ok) {
    const errData = await res.json();
    throw new Error(errData.error || 'Failed to register file');
  }
  return res.json();
}

export function useDriveFileUpload({
  entityType,
  entityId,
  fileType,
  onSuccess,
}: UseDriveFileUploadOptions) {
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
      const { uploadUrl, folderId } = await requestUploadUrl(entityType, entityId, {
        filename: file.name,
        mime_type: file.type,
        file_size_bytes: file.size,
        file_type: fileType,
      });

      // Step 2: Upload directly to Google Drive
      const driveFileId = await uploadToDrive(uploadUrl, file, (pct) => {
        setUploadState((prev) => ({ ...prev, progress: pct }));
      });

      // Step 3: Register metadata in our DB
      await registerFile({
        entity_type: entityType,
        entity_id: entityId,
        google_drive_file_id: driveFileId,
        google_drive_folder_id: folderId,
        file_type: fileType,
        filename: file.name,
        mime_type: file.type,
        file_size_bytes: file.size,
        title: file.name.replace(/\.[^.]+$/, ''),
        visibility: 'students', // Default to students visibility
      });
    },
    onSuccess: () => {
      setUploadState({ isUploading: false, progress: 100, error: null });
      queryClient.invalidateQueries({
        queryKey: ['drive-files', entityType, entityId],
      });
      toast.success('File uploaded successfully');
      onSuccess?.();
    },
    onError: (error: Error) => {
      setUploadState({ isUploading: false, progress: 0, error: error.message });
      toast.error(error.message || 'Failed to upload file');
    },
  });

  const upload = useCallback(
    (file: File) => mutation.mutate(file),
    [mutation]
  );

  return { ...uploadState, upload };
}
