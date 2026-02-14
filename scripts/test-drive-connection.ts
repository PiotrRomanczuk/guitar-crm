/**
 * Test script to diagnose Google Drive connection issues
 * Run with: npx tsx scripts/test-drive-connection.ts
 */

import { config } from 'dotenv';
import { resolve } from 'path';

// Load environment variables
config({ path: resolve(process.cwd(), '.env.local') });

import {
  getServiceAccountDriveClient,
  findFolderByName,
  listFilesInFolder
} from '../lib/services/google-drive-service-account';

async function testConnection() {
  console.log('🔍 Testing Google Drive Connection...\n');

  // Test 1: Check environment variables
  console.log('1️⃣ Checking environment variables...');
  const hasServiceKey = !!process.env.GOOGLE_SERVICE_ACCOUNT_KEY;
  const hasFolderId = !!process.env.GOOGLE_DRIVE_FOLDER_ID;

  console.log(`   GOOGLE_SERVICE_ACCOUNT_KEY: ${hasServiceKey ? '✅ Set' : '❌ Missing'}`);
  console.log(`   GOOGLE_DRIVE_FOLDER_ID: ${hasFolderId ? '✅ Set' : '❌ Missing'}`);

  if (hasFolderId) {
    const rawFolderId = process.env.GOOGLE_DRIVE_FOLDER_ID!;
    const cleanFolderId = rawFolderId.split('?')[0];
    console.log(`   Clean Folder ID: ${cleanFolderId}`);
  }

  if (!hasServiceKey || !hasFolderId) {
    console.error('\n❌ Missing required environment variables');
    process.exit(1);
  }

  // Test 2: Initialize Drive client
  console.log('\n2️⃣ Initializing Google Drive client...');
  try {
    const drive = getServiceAccountDriveClient();
    console.log('   ✅ Drive client initialized successfully');
  } catch (error) {
    console.error('   ❌ Failed to initialize Drive client:', error);
    process.exit(1);
  }

  // Test 3: Find the folder
  console.log('\n3️⃣ Looking for folder "07_Guitar Videos"...');
  try {
    const parentFolderId = process.env.GOOGLE_DRIVE_FOLDER_ID!.split('?')[0];
    const folderName = '07_Guitar Videos';

    console.log(`   Parent Folder ID: ${parentFolderId}`);
    console.log(`   Searching for: "${folderName}"`);

    const folderId = await findFolderByName(parentFolderId, folderName);

    if (folderId) {
      console.log(`   ✅ Found folder! ID: ${folderId}`);

      // Test 4: List files in the folder
      console.log('\n4️⃣ Listing video files in the folder...');
      const files = await listFilesInFolder(folderId, 'video/');
      console.log(`   ✅ Found ${files.length} video file(s)`);

      if (files.length > 0) {
        console.log('\n   First 5 files:');
        files.slice(0, 5).forEach((file, i) => {
          console.log(`   ${i + 1}. ${file.name} (${file.mimeType})`);
        });
      }
    } else {
      console.error(`   ❌ Folder "${folderName}" not found in parent folder ${parentFolderId}`);
      console.log('\n💡 Troubleshooting tips:');
      console.log('   1. Verify the folder name is exactly "07_Guitar Videos"');
      console.log('   2. Check that the folder exists in the parent folder');
      console.log('   3. Ensure the service account has access to the parent folder');
      console.log('   4. Try sharing the parent folder with the service account email:');
      const serviceKey = JSON.parse(process.env.GOOGLE_SERVICE_ACCOUNT_KEY!);
      console.log(`      ${serviceKey.client_email}`);
    }
  } catch (error) {
    console.error('   ❌ Error:', error);

    if (error instanceof Error) {
      console.log('\n💡 Error details:', error.message);

      if (error.message.includes('permission') || error.message.includes('403')) {
        console.log('\n📝 This appears to be a permission issue.');
        console.log('   The service account needs access to the Google Drive folder.');
        const serviceKey = JSON.parse(process.env.GOOGLE_SERVICE_ACCOUNT_KEY!);
        console.log(`   Share the folder with: ${serviceKey.client_email}`);
      }
    }
  }

  console.log('\n✨ Test complete!\n');
}

testConnection().catch((error) => {
  console.error('Fatal error:', error);
  process.exit(1);
});
