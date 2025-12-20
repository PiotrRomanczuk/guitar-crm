import * as dotenv from 'dotenv';

// Load environment variables BEFORE importing files that use them
dotenv.config({ path: '.env.local' });

console.log('GMAIL_USER:', process.env.GMAIL_USER);
console.log('GMAIL_APP_PASSWORD:', process.env.GMAIL_APP_PASSWORD ? '******' : 'UNDEFINED');
console.log('NEXT_PUBLIC_API_BASE_URL_REMOTE:', process.env.NEXT_PUBLIC_API_BASE_URL_REMOTE);

async function testLessonEmail() {
  // Dynamic import to ensure env vars are loaded first
  const { sendLessonCompletedEmail } = await import('../lib/email/send-lesson-email');
  
  console.log('Starting lesson email test...');

  const testData = {
    studentEmail: 'p.romanczuk@gmail.com',
    studentName: 'Piotr Admin',
    lessonDate: new Date().toLocaleDateString('en-US', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' }),
    lessonTitle: 'Advanced Fingerstyle Techniques',
    notes: 'Great progress today! Focus on keeping your thumb independent from your fingers. The syncopation in the second bar is tricky, so practice it slowly.',
    songs: [
      {
        id: 'song-123',
        title: 'Blackbird',
        artist: 'The Beatles',
        status: 'In Progress',
        notes: 'Watch the timing on the bridge section.'
      },
      {
        id: 'song-456',
        title: 'Neon',
        artist: 'John Mayer',
        status: 'Started',
        notes: 'Just the main riff for now. Keep the thumb slap consistent.'
      },
      {
        id: 'song-789',
        title: 'Wonderwall',
        artist: 'Oasis',
        status: 'Completed',
        notes: 'Perfect! Ready to perform.'
      }
    ]
  };

  console.log('Sending test email to:', testData.studentEmail);
  
  try {
    const result = await sendLessonCompletedEmail(testData);
    
    if (result.error) {
      console.error('Failed to send email:', result.error);
    } else {
      console.log('Email sent successfully!', result.data);
    }
  } catch (error) {
    console.error('Unexpected error:', error);
  }
}

testLessonEmail();
