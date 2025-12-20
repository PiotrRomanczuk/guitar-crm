import { NextResponse } from 'next/server';
import { sendAdminSongReport } from '@/app/actions/email/send-admin-report';

export const dynamic = 'force-dynamic'; // static by default, unless reading the request

export async function GET(request: Request) {
  // Verify the request is from Vercel Cron
  const authHeader = request.headers.get('authorization');
  if (authHeader !== `Bearer ${process.env.CRON_SECRET}`) {
    return new NextResponse('Unauthorized', { status: 401 });
  }

  try {
    console.log('[Cron] Starting daily song report...');
    const result = await sendAdminSongReport();
    
    if (result.success) {
      console.log('[Cron] Daily song report sent successfully.');
      return NextResponse.json({ success: true });
    } else {
      console.error('[Cron] Failed to send daily song report:', result.error);
      return NextResponse.json({ success: false, error: result.error }, { status: 500 });
    }
  } catch (error) {
    console.error('[Cron] Unexpected error:', error);
    return NextResponse.json({ success: false, error: 'Internal Server Error' }, { status: 500 });
  }
}
