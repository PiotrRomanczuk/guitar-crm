import { google, drive_v3 } from 'googleapis';
import { getGoogleClient } from '@/lib/google';
import { withRetry, AI_PROVIDER_RETRY_CONFIG } from '@/lib/ai/retry';
import { createLogger } from '@/lib/logger';

const log = createLogger('GoogleDrive');

const DRIVE_FOLDER_ID = process.env.GOOGLE_DRIVE_FOLDER_ID || '';

function getDriveClient(auth: Awaited<ReturnType<typeof getGoogleClient>>): drive_v3.Drive {
  return google.drive({ version: 'v3', auth });
}

/**
 * Create a resumable upload URI for direct client-side upload to Google Drive.
 * Returns the URI that the client uses to PUT file bytes.
 */
export async function createResumableUploadUrl(
  userId: string,
  filename: string,
  mimeType: string,
  fileSizeBytes?: number
): Promise<{ uploadUrl: string; folderId: string }> {
  const auth = await getGoogleClient(userId);
  const drive = getDriveClient(auth);
  const folderId = DRIVE_FOLDER_ID;

  const res = await withRetry(async () => {
    return drive.files.create(
      {
        requestBody: {
          name: filename,
          mimeType,
          parents: folderId ? [folderId] : undefined,
        },
        media: { mimeType, body: '' },
        fields: 'id',
      },
      {
        // Request a resumable upload URI only
        headers: {
          'X-Upload-Content-Type': mimeType,
          ...(fileSizeBytes ? { 'X-Upload-Content-Length': String(fileSizeBytes) } : {}),
        },
        // Use resumable upload protocol
        params: { uploadType: 'resumable' },
      }
    );
  }, AI_PROVIDER_RETRY_CONFIG);

  const uploadUrl = res.headers?.location;
  if (!uploadUrl) {
    throw new Error('Failed to obtain resumable upload URL from Google Drive');
  }

  log.info('Created resumable upload URL', { filename, folderId });
  return { uploadUrl, folderId };
}

/**
 * Get metadata for a file stored in Google Drive.
 */
export async function getVideoMetadata(
  userId: string,
  fileId: string
): Promise<{
  id: string;
  name: string;
  mimeType: string;
  size: number;
  thumbnailLink: string | null;
}> {
  const auth = await getGoogleClient(userId);
  const drive = getDriveClient(auth);

  const res = await withRetry(async () => {
    return drive.files.get({
      fileId,
      fields: 'id,name,mimeType,size,thumbnailLink',
    });
  }, AI_PROVIDER_RETRY_CONFIG);

  return {
    id: res.data.id || fileId,
    name: res.data.name || '',
    mimeType: res.data.mimeType || '',
    size: Number(res.data.size || 0),
    thumbnailLink: res.data.thumbnailLink || null,
  };
}

/**
 * Get a short-lived download/stream URL for a Drive file.
 * Uses webContentLink for direct download access.
 */
export async function getVideoStreamUrl(
  userId: string,
  fileId: string
): Promise<string> {
  const auth = await getGoogleClient(userId);
  const drive = getDriveClient(auth);

  const res = await withRetry(async () => {
    return drive.files.get({
      fileId,
      fields: 'webContentLink',
    });
  }, AI_PROVIDER_RETRY_CONFIG);

  if (!res.data.webContentLink) {
    // Fall back to generating a direct download link
    return `https://www.googleapis.com/drive/v3/files/${fileId}?alt=media`;
  }

  return res.data.webContentLink;
}

/**
 * Delete a file from Google Drive.
 */
export async function deleteVideoFromDrive(
  userId: string,
  fileId: string
): Promise<void> {
  const auth = await getGoogleClient(userId);
  const drive = getDriveClient(auth);

  await withRetry(async () => {
    await drive.files.delete({ fileId });
  }, {
    ...AI_PROVIDER_RETRY_CONFIG,
    retryableErrors: [
      ...(AI_PROVIDER_RETRY_CONFIG.retryableErrors || []),
      '404',
    ],
  });

  log.info('Deleted video from Drive', { fileId });
}

/**
 * Make a Drive file viewable by anyone with the link (for streaming).
 */
export async function setFilePublicReadable(
  userId: string,
  fileId: string
): Promise<void> {
  const auth = await getGoogleClient(userId);
  const drive = getDriveClient(auth);

  await withRetry(async () => {
    await drive.permissions.create({
      fileId,
      requestBody: {
        role: 'reader',
        type: 'anyone',
      },
    });
  }, AI_PROVIDER_RETRY_CONFIG);
}
