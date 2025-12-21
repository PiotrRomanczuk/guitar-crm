import { google } from 'googleapis';
import fs from 'fs';
import path from 'path';

const SCOPES = ['https://www.googleapis.com/auth/drive.file'];

async function uploadFile() {
  const filePath = process.argv[2];
  
  if (!filePath) {
    console.error('Please provide a file path');
    process.exit(1);
  }

  if (!fs.existsSync(filePath)) {
    console.error('File not found:', filePath);
    process.exit(1);
  }

  // Check for Service Account Credentials
  const serviceAccountKey = process.env.GOOGLE_SERVICE_ACCOUNT_KEY;
  const folderId = process.env.GOOGLE_DRIVE_FOLDER_ID;

  if (!serviceAccountKey) {
    console.error('❌ Error: GOOGLE_SERVICE_ACCOUNT_KEY environment variable is required');
    console.error('   This should be the JSON content of your service account key');
    process.exit(1);
  }

  if (!folderId) {
    console.error('❌ Error: GOOGLE_DRIVE_FOLDER_ID environment variable is required');
    process.exit(1);
  }

  try {
    // Parse service account credentials
    const credentials = JSON.parse(serviceAccountKey);

    // Configure auth client
    const auth = new google.auth.GoogleAuth({
      credentials,
      scopes: SCOPES,
    });

    const drive = google.drive({ version: 'v3', auth });

    const fileName = path.basename(filePath);
    const fileSize = fs.statSync(filePath).size;

    console.log(`📤 Uploading ${fileName} (${(fileSize / 1024 / 1024).toFixed(2)} MB) to Google Drive...`);

    const fileMetadata = {
      name: fileName,
      parents: [folderId],
    };

    const media = {
      mimeType: 'application/sql',
      body: fs.createReadStream(filePath),
    };

    const response = await drive.files.create({
      requestBody: fileMetadata,
      media: media,
      fields: 'id, name, webViewLink',
    });

    console.log('✅ Upload successful!');
    console.log('   File ID:', response.data.id);
    console.log('   Link:', response.data.webViewLink);

  } catch (error: any) {
    console.error('❌ Upload failed:', error.message);
    if (error.response) {
      console.error('   Details:', error.response.data);
    }
    process.exit(1);
  }
}

if (require.main === module) {
  uploadFile();
}

export { uploadFile };
