import { google, drive_v3 } from 'googleapis';
import { withRetry, DEFAULT_RETRY_CONFIG } from '@/lib/ai/retry';

let cachedClient: drive_v3.Drive | null = null;

/**
 * Build a Google Drive client authenticated via the service account key
 * stored in GOOGLE_SERVICE_ACCOUNT_KEY (JSON string).
 */
export function getServiceAccountDriveClient(): drive_v3.Drive {
  if (cachedClient) return cachedClient;

  const raw = process.env.GOOGLE_SERVICE_ACCOUNT_KEY;
  if (!raw) {
    throw new Error('Missing GOOGLE_SERVICE_ACCOUNT_KEY environment variable');
  }

  const credentials = JSON.parse(raw) as {
    client_email: string;
    private_key: string;
  };

  const auth = new google.auth.GoogleAuth({
    credentials,
    scopes: ['https://www.googleapis.com/auth/drive.readonly'],
  });

  cachedClient = google.drive({ version: 'v3', auth });
  return cachedClient;
}

export interface DriveFileInfo {
  id: string;
  name: string;
  mimeType: string;
  size: number;
  thumbnailLink: string | null;
}

/**
 * List all files in a Drive folder. Handles pagination automatically.
 * Optionally filter by MIME type prefix (e.g. "video/").
 */
export async function listFilesInFolder(
  folderId: string,
  mimeTypePrefix?: string
): Promise<DriveFileInfo[]> {
  const drive = getServiceAccountDriveClient();
  const files: DriveFileInfo[] = [];
  let pageToken: string | undefined;

  do {
    const res = await withRetry(async () => {
      return drive.files.list({
        q: `'${folderId}' in parents and trashed = false`,
        fields: 'nextPageToken, files(id, name, mimeType, size, thumbnailLink)',
        pageSize: 1000,
        pageToken,
      });
    }, DEFAULT_RETRY_CONFIG);

    for (const f of res.data.files || []) {
      if (mimeTypePrefix && !f.mimeType?.startsWith(mimeTypePrefix)) continue;
      files.push({
        id: f.id || '',
        name: f.name || '',
        mimeType: f.mimeType || '',
        size: Number(f.size || 0),
        thumbnailLink: f.thumbnailLink || null,
      });
    }

    pageToken = res.data.nextPageToken || undefined;
  } while (pageToken);

  return files;
}

/**
 * Find a subfolder by name inside a parent folder.
 * Returns the folder ID or null if not found.
 */
export async function findFolderByName(
  parentId: string,
  name: string
): Promise<string | null> {
  const drive = getServiceAccountDriveClient();

  const res = await withRetry(async () => {
    return drive.files.list({
      q: `'${parentId}' in parents and name = '${name}' and mimeType = 'application/vnd.google-apps.folder' and trashed = false`,
      fields: 'files(id, name)',
      pageSize: 1,
    });
  }, DEFAULT_RETRY_CONFIG);

  return res.data.files?.[0]?.id || null;
}
