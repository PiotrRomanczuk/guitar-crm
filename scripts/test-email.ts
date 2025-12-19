
import * as dotenv from 'dotenv';
import path from 'path';

// Load environment variables from .env.local
dotenv.config({ path: path.resolve(process.cwd(), '.env.local') });

async function testEmail() {
  console.log('🧪 Starting Resend Email Test...');

  if (!process.env.RESEND_API_KEY) {
    console.error('❌ RESEND_API_KEY is missing in .env.local');
    return;
  }

  // Dynamic import
  const { Resend } = await import('resend');
  const resend = new Resend(process.env.RESEND_API_KEY);

  const testEmail = 'delivered@resend.dev'; // Resend's magic address that always succeeds (or use your own verified email)
  // Actually, in Sandbox, you can only send TO your own email.
  // 'delivered@resend.dev' might not work if it's not verified in your sandbox.
  // Let's try sending to the address configured in the account if possible, but we don't know it.
  // We'll try a generic one and see the error.
  
  const toEmail = 'p.romanczuk@gmail.com'; // Using the verified sandbox email

  console.log(`\nAttempting to send email to: ${toEmail}`);
  console.log(`From: Guitar CRM <onboarding@resend.dev>`);

  try {
    const { data, error } = await resend.emails.send({
      from: 'Guitar CRM <onboarding@resend.dev>',
      to: toEmail,
      subject: 'Test Email from Guitar CRM Script',
      html: '<p>This is a test email to verify Resend configuration.</p>',
    });

    if (error) {
      console.error('❌ Resend API Error:', JSON.stringify(error, null, 2));
      
      if (error.name === 'validation_error' && error.message.includes('resend.dev')) {
         console.log('\n💡 TIP: In Resend Sandbox mode, you can only send emails to the address you signed up with.');
         console.log('   Please update the "to" address in this script to your verified email to test success.');
      }
    } else {
      console.log('✅ Email sent successfully!');
      console.log('ID:', data?.id);
    }
  } catch (err) {
    console.error('❌ Exception:', err);
  }
}

testEmail().catch(console.error);
