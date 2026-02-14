'use client';

import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { toast } from 'sonner';
import type { DriveFile, EntityType, FileType } from '@/types/DriveFile';

interface UseDriveFilesOptions {
  entityType: EntityType;
  entityId: string;
  fileType?: FileType;
}

async function fetchFiles(
  entityType: EntityType,
  entityId: string,
  fileType?: FileType
): Promise<DriveFile[]> {
  const params = new URLSearchParams({
    entity_type: entityType,
    entity_id: entityId,
  });
  if (fileType) {
    params.append('file_type', fileType);
  }

  const res = await fetch(`/api/drive/files?${params}`);
  if (!res.ok) throw new Error('Failed to load files');
  const data = await res.json();
  return data.files;
}

async function deleteFile(fileId: string) {
  const res = await fetch(`/api/drive/files/${fileId}`, { method: 'DELETE' });
  if (!res.ok) {
    const data = await res.json();
    throw new Error(data.error || 'Failed to delete file');
  }
}

async function updateFile(
  fileId: string,
  updates: {
    title?: string;
    description?: string;
    visibility?: 'private' | 'students' | 'public';
    display_order?: number;
  }
) {
  const res = await fetch(`/api/drive/files/${fileId}`, {
    method: 'PATCH',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(updates),
  });
  if (!res.ok) {
    const data = await res.json();
    throw new Error(data.error || 'Failed to update file');
  }
  return res.json();
}

export function useDriveFiles({ entityType, entityId, fileType }: UseDriveFilesOptions) {
  const queryClient = useQueryClient();

  const { data: files = [], isLoading } = useQuery({
    queryKey: ['drive-files', entityType, entityId, fileType],
    queryFn: () => fetchFiles(entityType, entityId, fileType),
  });

  const deleteMutation = useMutation({
    mutationFn: deleteFile,
    onSuccess: () => {
      queryClient.invalidateQueries({
        queryKey: ['drive-files', entityType, entityId],
      });
      toast.success('File deleted');
    },
    onError: (err: Error) => {
      toast.error(err.message || 'Failed to delete file');
    },
  });

  const updateMutation = useMutation({
    mutationFn: ({ fileId, updates }: { fileId: string; updates: Parameters<typeof updateFile>[1] }) =>
      updateFile(fileId, updates),
    onSuccess: () => {
      queryClient.invalidateQueries({
        queryKey: ['drive-files', entityType, entityId],
      });
      toast.success('File updated');
    },
    onError: (err: Error) => {
      toast.error(err.message || 'Failed to update file');
    },
  });

  return {
    files,
    isLoading,
    deleteFile: deleteMutation.mutate,
    updateFile: (fileId: string, updates: Parameters<typeof updateFile>[1]) =>
      updateMutation.mutate({ fileId, updates }),
    isDeleting: deleteMutation.isPending,
    isUpdating: updateMutation.isPending,
  };
}
