import { getGoogleAuthUrl } from '@/lib/google';
import { redirect } from 'next/navigation';

export async function GET() {
  const url = getGoogleAuthUrl();
  redirect(url);
}
