#!/usr/bin/env tsx

/**
 * Consolidated Email Testing Script
 * Tests various email functionality
 *
 * Usage:
 *   npx tsx scripts/testing/test-emails.ts                    # Interactive menu
 *   npx tsx scripts/testing/test-emails.ts lesson             # Test lesson email
 *   npx tsx scripts/testing/test-emails.ts reminder           # Test reminder email
 *   npx tsx scripts/testing/test-emails.ts all                # Test all email types
 */

import * as dotenv from 'dotenv';
import path from 'path';

// Load environment variables from .env.local
dotenv.config({ path: path.resolve(process.cwd(), '.env.local') });

const EMAIL_TYPES = ['lesson', 'reminder', 'all'] as const;
type EmailType = (typeof EMAIL_TYPES)[number];

async function checkEnv(): Promise<boolean> {
  if (!process.env.GMAIL_USER || !process.env.GMAIL_APP_PASSWORD) {
    console.error('❌ GMAIL_USER or GMAIL_APP_PASSWORD is missing in .env.local');
    return false;
  }
  console.log('✅ Email credentials configured');
  return true;
}

async function testLessonEmail() {
  console.log('\n📧 Testing Lesson Completed Email...');

  const { sendLessonCompletedEmail } = await import('../../lib/email/send-lesson-email');
  const toEmail = process.env.GMAIL_USER!;

  const result = await sendLessonCompletedEmail({
    studentEmail: toEmail,
    studentName: 'Test Student',
    lessonDate: new Date().toLocaleDateString('en-US', {
      weekday: 'long',
      year: 'numeric',
      month: 'long',
      day: 'numeric',
    }),
    lessonTitle: 'Advanced Fingerstyle Techniques',
    notes:
      'Great progress today! Focus on keeping your thumb independent from your fingers. The syncopation in the second bar is tricky, so practice it slowly.',
    songs: [
      {
        id: 'song-123',
        title: 'Blackbird',
        artist: 'The Beatles',
        status: 'In Progress',
        notes: 'Watch the timing on the bridge section.',
      },
      {
        id: 'song-456',
        title: 'Neon',
        artist: 'John Mayer',
        status: 'Started',
        notes: 'Just the main riff for now. Keep the thumb slap consistent.',
      },
      {
        id: 'song-789',
        title: 'Wonderwall',
        artist: 'Oasis',
        status: 'Completed',
        notes: 'Perfect! Ready to perform.',
      },
    ],
  });

  if (result.error) {
    console.error('❌ Failed to send lesson email:', result.error);
  } else {
    console.log('✅ Lesson email sent successfully!');
  }
}

async function testReminderEmail() {
  console.log('\n📧 Testing Lesson Reminder Email...');

  const { sendLessonReminderEmail } = await import('../../lib/email/send-reminder-email');
  const toEmail = process.env.GMAIL_USER!;

  const result = await sendLessonReminderEmail({
    studentEmail: toEmail,
    studentName: 'Test Student',
    lessonDate: 'Monday, December 22, 2025',
    lessonTime: '18:00',
    location: 'Online (Zoom)',
    agenda: 'Reviewing "Blackbird" and starting new theory module.',
  });

  if (result.error) {
    console.error('❌ Failed to send reminder email:', result.error);
  } else {
    console.log('✅ Reminder email sent successfully!');
  }
}

async function main() {
  console.log('🧪 EMAIL TESTING UTILITY');
  console.log('========================\n');

  if (!(await checkEnv())) {
    process.exit(1);
  }

  const emailType = (process.argv[2] as EmailType) || 'all';

  if (!EMAIL_TYPES.includes(emailType)) {
    console.error(`❌ Unknown email type: ${emailType}`);
    console.log(`Available types: ${EMAIL_TYPES.join(', ')}`);
    process.exit(1);
  }

  try {
    if (emailType === 'lesson' || emailType === 'all') {
      await testLessonEmail();
    }

    if (emailType === 'reminder' || emailType === 'all') {
      await testReminderEmail();
    }

    console.log('\n✅ Email testing completed!');
  } catch (error) {
    console.error('\n❌ Error during testing:', error);
    process.exit(1);
  }
}

main().catch(console.error);
