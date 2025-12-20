// Load environment variables BEFORE importing files that use them
import * as dotenv from 'dotenv';
dotenv.config({ path: '.env.local' });

console.log('GMAIL_USER:', process.env.GMAIL_USER);
console.log('GMAIL_APP_PASSWORD:', process.env.GMAIL_APP_PASSWORD ? '******' : 'UNDEFINED');
console.log('NEXT_PUBLIC_API_BASE_URL_REMOTE:', process.env.NEXT_PUBLIC_API_BASE_URL_REMOTE);

async function testReminderEmail() {
  // Dynamic import to ensure env vars are loaded first
  const { sendLessonReminderEmail } = await import('../lib/email/send-reminder-email');

  console.log('Starting reminder email test...');

  const testData = {
    studentEmail: 'p.romanczuk@gmail.com',
    studentName: 'Piotr Admin',
    lessonDate: 'Monday, December 22, 2025',
    lessonTime: '18:00',
    location: 'Online (Zoom)',
    agenda: 'Reviewing "Blackbird" and starting new theory module.',
  };

  console.log('Sending test email to:', testData.studentEmail);

  try {
    const result = await sendLessonReminderEmail(testData);

    if (result.error) {
      console.error('Failed to send email:', result.error);
    } else {
      console.log('Email sent successfully!', result.data);
    }
  } catch (error) {
    console.error('Unexpected error:', error);
  }
}

testReminderEmail();
