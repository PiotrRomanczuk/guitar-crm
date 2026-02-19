/**
 * Type definitions for Drive Files
 * Complements Zod schemas in /schemas/DriveFileSchema.ts
 */

import type { DriveFile as ZodDriveFile } from '@/schemas/DriveFileSchema';

/**
 * File type union
 */
export type FileType = 'audio' | 'pdf' | 'video' | 'document' | 'image';

/**
 * Entity type union
 */
export type EntityType = 'song' | 'lesson' | 'assignment' | 'profile';

/**
 * Visibility level union
 */
export type Visibility = 'private' | 'students' | 'public';

/**
 * Type-specific metadata interfaces
 */
export interface AudioMetadata {
  duration_seconds?: number;
  artist?: string;
  album?: string;
  genre?: string;
  [key: string]: unknown;
}

export interface PdfMetadata {
  page_count?: number;
  [key: string]: unknown;
}

export interface VideoMetadata {
  duration_seconds?: number;
  thumbnail_url?: string;
  width?: number;
  height?: number;
  [key: string]: unknown;
}

export interface DocumentMetadata {
  page_count?: number;
  word_count?: number;
  [key: string]: unknown;
}

export interface ImageMetadata {
  width?: number;
  height?: number;
  thumbnail_url?: string;
  [key: string]: unknown;
}

/**
 * Unified metadata type (discriminated union)
 */
export type FileMetadata =
  | AudioMetadata
  | PdfMetadata
  | VideoMetadata
  | DocumentMetadata
  | ImageMetadata;

/**
 * Main DriveFile interface
 */
export interface DriveFile extends Omit<ZodDriveFile, 'metadata'> {
  metadata: FileMetadata;
}

/**
 * File with user info (for display)
 */
export interface DriveFileWithUser extends DriveFile {
  uploader: {
    id: string;
    name: string;
    avatar_url: string | null;
  };
}

/**
 * Create file input
 */
export interface CreateDriveFileInput {
  entity_type: EntityType;
  entity_id: string;
  google_drive_file_id: string;
  google_drive_folder_id?: string;
  file_type: FileType;
  filename: string;
  title?: string;
  description?: string;
  mime_type: string;
  file_size_bytes?: number;
  metadata?: FileMetadata;
  visibility?: Visibility;
  display_order?: number;
}

/**
 * Update file input
 */
export interface UpdateDriveFileInput {
  title?: string;
  description?: string;
  metadata?: Partial<FileMetadata>;
  visibility?: Visibility;
  display_order?: number;
}

/**
 * Query parameters for listing files
 */
export interface ListDriveFilesQuery {
  entity_type?: EntityType;
  entity_id?: string;
  file_type?: FileType;
  visibility?: Visibility;
}

/**
 * Upload URL response
 */
export interface GenerateUploadUrlResponse {
  uploadUrl: string;
  folderId: string;
}

/**
 * File card props (for UI components)
 */
export interface DriveFileCardProps {
  file: DriveFile | DriveFileWithUser;
  onDelete?: (fileId: string) => void;
  onEdit?: (fileId: string) => void;
  onPlay?: (fileId: string) => void;
  isLoading?: boolean;
}

/**
 * Gallery props (for UI components)
 */
export interface DriveFileGalleryProps {
  entityType: EntityType;
  entityId: string;
  fileType?: FileType;
  allowUpload?: boolean;
  allowEdit?: boolean;
  allowDelete?: boolean;
}

/**
 * Upload props (for UI components)
 */
export interface DriveFileUploadProps {
  entityType: EntityType;
  entityId: string;
  fileType: FileType;
  maxSizeBytes?: number;
  onUploadComplete?: (file: DriveFile) => void;
}
