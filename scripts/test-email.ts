
import * as dotenv from 'dotenv';
import path from 'path';

// Load environment variables from .env.local
dotenv.config({ path: path.resolve(process.cwd(), '.env.local') });

async function testEmail() {
  console.log('🧪 Starting SMTP Email Test...');

  if (!process.env.GMAIL_USER || !process.env.GMAIL_APP_PASSWORD) {
    console.error('❌ GMAIL_USER or GMAIL_APP_PASSWORD is missing in .env.local');
    return;
  }

  // Dynamic import
  const { sendLessonCompletedEmail } = await import('../lib/email/send-lesson-email');

  const toEmail = process.env.GMAIL_USER; // Send to self for testing

  console.log(`\nAttempting to send email to: ${toEmail}`);

  try {
    await sendLessonCompletedEmail({
      studentEmail: toEmail,
      studentName: 'Test Student',
      lessonDate: new Date().toLocaleDateString(),
      lessonTitle: 'Advanced Fingerstyle Techniques',
      notes: 'Great progress today! Remember to keep your thumb independent from the fingers.',
      songs: [
        {
          title: 'Blackbird',
          artist: 'The Beatles',
          status: 'In Progress',
          notes: 'Focus on the timing in the bridge.'
        },
        {
          title: 'Neon',
          artist: 'John Mayer',
          status: 'Started',
          notes: 'Just the intro riff for now.'
        }
      ]
    });

    console.log('✅ Template email sent successfully!');
  } catch (err) {
    console.error('❌ Exception:', err);
  }
}

testEmail().catch(console.error);
