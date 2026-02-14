'use client';

import { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from '@/components/ui/alert-dialog';
import {
  FileAudio,
  FileText,
  FileVideo,
  Image as ImageIcon,
  File as FileIcon,
  Loader2,
} from 'lucide-react';
import { useDriveFiles } from './hooks/useDriveFiles';
import DriveFileCard from './DriveFileCard';
import DriveFilePreview from './DriveFilePreview';
import DriveFileUpload from './DriveFileUpload';
import type { DriveFile, EntityType, FileType } from '@/types/DriveFile';

const FILE_TYPE_ICONS: Record<FileType, React.ComponentType<{ className?: string }>> = {
  audio: FileAudio,
  pdf: FileText,
  video: FileVideo,
  image: ImageIcon,
  document: FileIcon,
};

const FILE_TYPE_LABELS: Record<FileType, { singular: string; plural: string; empty: string }> = {
  audio: {
    singular: 'Audio Track',
    plural: 'Audio Tracks',
    empty: 'No audio tracks yet. Upload backing tracks or practice recordings.',
  },
  pdf: {
    singular: 'PDF',
    plural: 'PDFs',
    empty: 'No PDFs yet. Upload sheet music, chord charts, or tablature.',
  },
  video: {
    singular: 'Video',
    plural: 'Videos',
    empty: 'No videos yet. Upload tutorial clips or demo recordings.',
  },
  image: {
    singular: 'Image',
    plural: 'Images',
    empty: 'No images yet. Upload photos or diagrams.',
  },
  document: {
    singular: 'Document',
    plural: 'Documents',
    empty: 'No documents yet. Upload lesson plans or practice schedules.',
  },
};

interface DriveFileGalleryProps {
  entityType: EntityType;
  entityId: string;
  fileType: FileType;
  isTeacher?: boolean;
  title?: string;
  showUpload?: boolean;
}

export default function DriveFileGallery({
  entityType,
  entityId,
  fileType,
  isTeacher = false,
  title,
  showUpload = true,
}: DriveFileGalleryProps) {
  const [activeFile, setActiveFile] = useState<DriveFile | null>(null);
  const [fileToDelete, setFileToDelete] = useState<DriveFile | null>(null);

  const { files, isLoading, deleteFile, isDeleting } = useDriveFiles({
    entityType,
    entityId,
    fileType,
  });

  const Icon = FILE_TYPE_ICONS[fileType];
  const labels = FILE_TYPE_LABELS[fileType];
  const displayTitle = title || labels.plural;

  return (
    <>
      <Card className="bg-card border-border/50 shadow-sm">
        <CardHeader className="pb-3 flex flex-row items-center justify-between">
          <CardTitle className="flex items-center gap-2 text-lg">
            <Icon className="w-5 h-5 text-primary" />
            {displayTitle}
            {files.length > 0 && (
              <span className="text-sm font-normal text-muted-foreground">
                ({files.length})
              </span>
            )}
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          {/* Loading State */}
          {isLoading ? (
            <div className="flex justify-center py-8">
              <Loader2 className="h-6 w-6 animate-spin text-muted-foreground" />
            </div>
          ) : files.length > 0 ? (
            /* Files Grid */
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
              {files.map((file) => (
                <DriveFileCard
                  key={file.id}
                  file={file}
                  isTeacher={isTeacher}
                  onPlay={setActiveFile}
                  onPreview={setActiveFile}
                  onDelete={setFileToDelete}
                  isDeleting={isDeleting}
                />
              ))}
            </div>
          ) : (
            /* Empty State */
            <div className="py-8 text-center bg-muted/30 rounded-lg border border-dashed border-border">
              <Icon className="w-10 h-10 text-muted-foreground/30 mx-auto mb-3" />
              <p className="text-muted-foreground font-medium">
                No {labels.plural.toLowerCase()} yet
              </p>
              {isTeacher && (
                <p className="text-sm text-muted-foreground/70 mt-1">{labels.empty}</p>
              )}
            </div>
          )}

          {/* Upload Section (Teachers Only) */}
          {isTeacher && showUpload && (
            <DriveFileUpload
              entityType={entityType}
              entityId={entityId}
              fileType={fileType}
            />
          )}
        </CardContent>
      </Card>

      {/* File Preview Modal */}
      <DriveFilePreview file={activeFile} onClose={() => setActiveFile(null)} />

      {/* Delete Confirmation */}
      <AlertDialog
        open={!!fileToDelete}
        onOpenChange={(open) => !open && setFileToDelete(null)}
      >
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Delete {labels.singular}</AlertDialogTitle>
            <AlertDialogDescription>
              This will permanently delete &quot;
              {fileToDelete?.title || fileToDelete?.filename}&quot; from both the app and
              Google Drive. This cannot be undone.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction
              onClick={() => fileToDelete && deleteFile(fileToDelete.id)}
              className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
            >
              {isDeleting ? 'Deleting...' : 'Delete'}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </>
  );
}
