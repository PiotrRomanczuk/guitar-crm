
import { sendAdminSongReport } from '@/app/actions/email/send-admin-report';

async function main() {
  console.log('Running manual email report trigger...');
  const result = await sendAdminSongReport();
  console.log('Result:', result);
}

main().catch(console.error);
