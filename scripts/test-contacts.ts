
import * as dotenv from 'dotenv';
import path from 'path';

// Load environment variables from .env.local
dotenv.config({ path: path.resolve(process.cwd(), '.env.local') });

async function testContacts() {
  console.log('🧪 Starting Resend Contacts API Test...');

  // Dynamic import to ensure env vars are loaded first
  const { createContact, getContact, updateContact, deleteContact, listContacts } = await import('../lib/email/contacts');

  const testEmail = `test-${Date.now()}@example.com`;
  const testFirstName = 'Test';
  const testLastName = 'User';

  // 1. Create Contact
  console.log(`\n1. Creating contact: ${testEmail}`);
  const createResult = await createContact({
    email: testEmail,
    firstName: testFirstName,
    lastName: testLastName,
    unsubscribed: false,
  });

  if (!createResult.success || !createResult.data) {
    console.error('❌ Failed to create contact:', createResult.error);
    return;
  }
  console.log('✅ Contact created:', createResult.data);
  const contactId = createResult.data.id;

  // 2. Get Contact
  console.log(`\n2. Getting contact by ID: ${contactId}`);
  const getResult = await getContact({ id: contactId });
  if (!getResult.success) {
    console.error('❌ Failed to get contact:', getResult.error);
  } else {
    console.log('✅ Contact retrieved:', getResult.data);
  }

  // 3. Update Contact
  console.log(`\n3. Updating contact...`);
  const updateResult = await updateContact({
    id: contactId,
    firstName: 'Updated',
    lastName: 'Name',
  });
  if (!updateResult.success) {
    console.error('❌ Failed to update contact:', updateResult.error);
  } else {
    console.log('✅ Contact updated:', updateResult.data);
  }

  // 4. List Contacts
  console.log(`\n4. Listing contacts...`);
  const listResult = await listContacts();
  if (!listResult.success) {
    console.error('❌ Failed to list contacts:', listResult.error);
  } else {
    console.log(`✅ Contacts listed (found ${listResult.data?.data?.length || 0})`);
  }

  // 5. Delete Contact
  console.log(`\n5. Deleting contact: ${contactId}`);
  const deleteResult = await deleteContact({ id: contactId });
  if (!deleteResult.success) {
    console.error('❌ Failed to delete contact:', deleteResult.error);
  } else {
    console.log('✅ Contact deleted:', deleteResult.data);
  }

  console.log('\n🎉 Test completed!');
}

testContacts().catch(console.error);
