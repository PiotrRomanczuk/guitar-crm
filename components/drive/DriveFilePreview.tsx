'use client';

import type { DriveFile } from '@/types/DriveFile';
import AudioPlayer from './AudioPlayer';
import PdfViewer from './PdfViewer';
import VideoPlayer from '../songs/videos/VideoPlayer';

interface DriveFilePreviewProps {
  file: DriveFile | null;
  onClose: () => void;
}

export default function DriveFilePreview({ file, onClose }: DriveFilePreviewProps) {
  if (!file) return null;

  // Route to appropriate viewer based on file type
  switch (file.file_type) {
    case 'audio':
      return <AudioPlayer file={file} onClose={onClose} />;

    case 'pdf':
      return <PdfViewer file={file} onClose={onClose} />;

    case 'video':
      // Convert DriveFile to SongVideo format for existing VideoPlayer
      // TODO: Create a generic VideoPlayer that accepts DriveFile
      return <VideoPlayer
        video={{
          id: file.id,
          song_id: file.entity_id, // Assuming entity is song
          uploaded_by: file.uploaded_by,
          google_drive_file_id: file.google_drive_file_id,
          google_drive_folder_id: file.google_drive_folder_id || undefined,
          title: file.title,
          filename: file.filename,
          mime_type: file.mime_type,
          file_size_bytes: file.file_size_bytes || undefined,
          duration_seconds:
            file.metadata && 'duration_seconds' in file.metadata
              ? file.metadata.duration_seconds
              : undefined,
          thumbnail_url:
            file.metadata && 'thumbnail_url' in file.metadata
              ? file.metadata.thumbnail_url
              : undefined,
          display_order: file.display_order,
          created_at: file.created_at,
          updated_at: file.updated_at,
        }}
        songId={file.entity_id}
        onClose={onClose}
      />;

    case 'image':
      // TODO: Create ImageViewer component
      return null;

    case 'document':
      // For documents, use PDF viewer (it can handle Google Docs)
      return <PdfViewer file={file} onClose={onClose} />;

    default:
      return null;
  }
}
