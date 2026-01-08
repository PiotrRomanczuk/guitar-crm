import * as dotenv from 'dotenv';
dotenv.config({ path: '.env.local' });

// Mock Data for Admin Report
const mockAdminStats = {
  totalSongs: 150,
  coverage: {
    chords: 85,
    youtube: 90,
    ultimateGuitar: 75,
    galleryImages: 60,
  },
  counts: {
    withChords: 127,
    withYoutube: 135,
    withUltimateGuitar: 112,
    withGalleryImages: 90,
  },
  missing: {
    chords: [
      { id: 'song-1', title: 'Wonderwall', author: 'Oasis' },
      { id: 'song-2', title: 'Hotel California', author: 'Eagles' },
    ],
    youtube: [{ id: 'song-3', title: 'Stairway to Heaven', author: 'Led Zeppelin' }],
    ultimateGuitar: [],
    galleryImages: [
      { id: 'song-4', title: 'Yesterday', author: 'The Beatles' },
      { id: 'song-5', title: 'Let It Be', author: 'The Beatles' },
    ],
  },
};

// Mock Data for Lesson Recap
const mockRecapData = {
  studentEmail: 'p.romanczuk@gmail.com',
  studentName: 'Piotr Admin',
  lessonDate: new Date().toLocaleDateString('en-US', {
    weekday: 'long',
    year: 'numeric',
    month: 'long',
    day: 'numeric',
  }),
  lessonTitle: 'Mastering the Pentatonic Scale',
  notes:
    'Excellent work on the improvisation section. Remember to use the blue note sparingly for effect.',
  songs: [
    {
      id: 'song-101',
      title: 'Little Wing',
      artist: 'Jimi Hendrix',
      status: 'In Progress',
      notes: 'Focus on the intro phrasing.',
    },
    {
      id: 'song-102',
      title: 'Sultans of Swing',
      artist: 'Dire Straits',
      status: 'Started',
      notes: 'Practice the first solo slowly.',
    },
  ],
};

// Mock Data for Lesson Reminder
const mockReminderData = {
  studentEmail: 'p.romanczuk@gmail.com',
  studentName: 'Piotr Admin',
  lessonDate: 'Monday, December 22, 2025',
  lessonTime: '18:00',
  location: 'Online (Zoom)',
  agenda: 'Reviewing "Little Wing" and starting "Sultans of Swing".',
};

async function sendAllEmails() {
  // Dynamic imports to ensure env vars are loaded first
  const transporter = (await import('../lib/email/smtp-client')).default;
  const { sendLessonCompletedEmail } = await import('../lib/email/send-lesson-email');
  const { sendLessonReminderEmail } = await import('../lib/email/send-reminder-email');
  const { generateAdminSongReportHtml } = await import('../lib/email/templates/admin-song-report');

  console.log('🚀 Starting to send all email templates to admin...');
  const adminEmail = 'p.romanczuk@gmail.com';

  // 1. Send Admin Report
  console.log('\n---------------------------------------------------');
  console.log('1. Sending Admin Song Database Report...');
  try {
    const html = generateAdminSongReportHtml(mockAdminStats);
    const info = await transporter.sendMail({
      from: `"Guitar CRM" <${process.env.GMAIL_USER}>`,
      to: adminEmail,
      subject: `[TEST] Song Database Report - ${new Date().toLocaleDateString()}`,
      html: html,
    });
    console.log('✅ Admin Report sent:', info.messageId);
  } catch (error) {
    console.error('❌ Failed to send Admin Report:', error);
  }

  // 2. Send Lesson Recap
  console.log('\n---------------------------------------------------');
  console.log('2. Sending Lesson Recap Email...');
  try {
    const result = await sendLessonCompletedEmail(mockRecapData);
    if (result.error) {
      console.error('❌ Failed to send Lesson Recap:', result.error);
    } else {
      console.log('✅ Lesson Recap sent:', result.data?.id);
    }
  } catch (error) {
    console.error('❌ Unexpected error sending Lesson Recap:', error);
  }

  // 3. Send Lesson Reminder
  console.log('\n---------------------------------------------------');
  console.log('3. Sending Lesson Reminder Email...');
  try {
    const result = await sendLessonReminderEmail(mockReminderData);
    if (result.error) {
      console.error('❌ Failed to send Lesson Reminder:', result.error);
    } else {
      console.log('✅ Lesson Reminder sent:', result.data?.id);
    }
  } catch (error) {
    console.error('❌ Unexpected error sending Lesson Reminder:', error);
  }

  console.log('\n---------------------------------------------------');
  console.log('🎉 All email tests completed.');
}

sendAllEmails();
