import { z } from 'zod';

/**
 * File types supported by the drive_files table
 */
export const FileTypeSchema = z.enum(['audio', 'pdf', 'video', 'document', 'image']);
export type FileType = z.infer<typeof FileTypeSchema>;

/**
 * Entity types that can have attached files
 */
export const EntityTypeSchema = z.enum(['song', 'lesson', 'assignment', 'profile']);
export type EntityType = z.infer<typeof EntityTypeSchema>;

/**
 * Visibility levels for files
 */
export const VisibilitySchema = z.enum(['private', 'students', 'public']);
export type Visibility = z.infer<typeof VisibilitySchema>;

/**
 * MIME type validation per file type
 */
const audioMimeTypes = [
  'audio/mpeg',
  'audio/mp3',
  'audio/wav',
  'audio/ogg',
  'audio/aac',
  'audio/m4a',
  'audio/flac',
];

const pdfMimeTypes = ['application/pdf'];

const videoMimeTypes = [
  'video/mp4',
  'video/mpeg',
  'video/quicktime',
  'video/x-msvideo',
  'video/webm',
];

const documentMimeTypes = [
  'application/vnd.google-apps.document',
  'application/msword',
  'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
  'text/plain',
];

const imageMimeTypes = [
  'image/jpeg',
  'image/jpg',
  'image/png',
  'image/gif',
  'image/webp',
  'image/svg+xml',
];

/**
 * Validate MIME type matches file type
 */
function validateMimeType(fileType: FileType, mimeType: string): boolean {
  switch (fileType) {
    case 'audio':
      return audioMimeTypes.includes(mimeType);
    case 'pdf':
      return pdfMimeTypes.includes(mimeType);
    case 'video':
      return videoMimeTypes.includes(mimeType);
    case 'document':
      return documentMimeTypes.includes(mimeType);
    case 'image':
      return imageMimeTypes.includes(mimeType);
    default:
      return false;
  }
}

/**
 * Type-specific metadata schemas
 */
export const AudioMetadataSchema = z.object({
  duration_seconds: z.number().optional(),
  artist: z.string().optional(),
  album: z.string().optional(),
  genre: z.string().optional(),
}).passthrough(); // Allow additional fields

export const PdfMetadataSchema = z.object({
  page_count: z.number().optional(),
}).passthrough();

export const VideoMetadataSchema = z.object({
  duration_seconds: z.number().optional(),
  thumbnail_url: z.string().url().optional(),
  width: z.number().optional(),
  height: z.number().optional(),
}).passthrough();

export const DocumentMetadataSchema = z.object({
  page_count: z.number().optional(),
  word_count: z.number().optional(),
}).passthrough();

export const ImageMetadataSchema = z.object({
  width: z.number().optional(),
  height: z.number().optional(),
  thumbnail_url: z.string().url().optional(),
}).passthrough();

/**
 * Full DriveFile schema (database row)
 */
export const DriveFileSchema = z.object({
  id: z.string().uuid(),
  uploaded_by: z.string().uuid(),
  entity_type: EntityTypeSchema,
  entity_id: z.string().uuid(),
  google_drive_file_id: z.string(),
  google_drive_folder_id: z.string().nullable(),
  file_type: FileTypeSchema,
  filename: z.string(),
  title: z.string().nullable(),
  description: z.string().nullable(),
  mime_type: z.string(),
  file_size_bytes: z.number().nullable(),
  metadata: z.record(z.unknown()).default({}),
  visibility: VisibilitySchema.default('private'),
  display_order: z.number().default(0),
  created_at: z.string().datetime(),
  updated_at: z.string().datetime(),
  deleted_at: z.string().datetime().nullable(),
});

export type DriveFile = z.infer<typeof DriveFileSchema>;

/**
 * Schema for creating a new file (POST request)
 */
export const CreateDriveFileInputSchema = z.object({
  entity_type: EntityTypeSchema,
  entity_id: z.string().uuid(),
  google_drive_file_id: z.string(),
  google_drive_folder_id: z.string().optional(),
  file_type: FileTypeSchema,
  filename: z.string().min(1).max(255),
  title: z.string().max(255).optional(),
  description: z.string().max(1000).optional(),
  mime_type: z.string(),
  file_size_bytes: z.number().positive().optional(),
  metadata: z.record(z.unknown()).optional(),
  visibility: VisibilitySchema.default('private'),
  display_order: z.number().int().min(0).optional(),
}).refine(
  (data) => validateMimeType(data.file_type, data.mime_type),
  {
    message: 'MIME type does not match file type',
    path: ['mime_type'],
  }
);

export type CreateDriveFileInput = z.infer<typeof CreateDriveFileInputSchema>;

/**
 * Schema for updating file metadata (PATCH request)
 */
export const UpdateDriveFileInputSchema = z.object({
  title: z.string().max(255).optional(),
  description: z.string().max(1000).optional(),
  metadata: z.record(z.unknown()).optional(),
  visibility: VisibilitySchema.optional(),
  display_order: z.number().int().min(0).optional(),
}).strict();

export type UpdateDriveFileInput = z.infer<typeof UpdateDriveFileInputSchema>;

/**
 * Schema for generating upload URL (POST /api/drive/files/upload-url)
 */
export const GenerateUploadUrlInputSchema = z.object({
  entity_type: EntityTypeSchema,
  entity_id: z.string().uuid(),
  file_type: FileTypeSchema,
  filename: z.string().min(1).max(255),
  mime_type: z.string(),
  file_size_bytes: z.number().positive().optional(),
}).refine(
  (data) => validateMimeType(data.file_type, data.mime_type),
  {
    message: 'MIME type does not match file type',
    path: ['mime_type'],
  }
);

export type GenerateUploadUrlInput = z.infer<typeof GenerateUploadUrlInputSchema>;

/**
 * Schema for querying files (GET /api/drive/files)
 */
export const ListDriveFilesQuerySchema = z.object({
  entity_type: EntityTypeSchema.optional(),
  entity_id: z.string().uuid().optional(),
  file_type: FileTypeSchema.optional(),
  visibility: VisibilitySchema.optional(),
}).refine(
  (data) => {
    // If entity_type is provided, entity_id must also be provided
    if (data.entity_type && !data.entity_id) {
      return false;
    }
    return true;
  },
  {
    message: 'entity_id is required when entity_type is provided',
    path: ['entity_id'],
  }
);

export type ListDriveFilesQuery = z.infer<typeof ListDriveFilesQuerySchema>;
