'use client';

import { useState } from 'react';
import { sendAdminSongReport } from '@/app/actions/email/send-admin-report';
import { toast } from 'sonner';
import { Mail, Loader2 } from 'lucide-react';

export function SendAdminReportButton() {
  const [isSending, setIsSending] = useState(false);

  const handleSendReport = async () => {
    setIsSending(true);
    try {
      const result = await sendAdminSongReport();
      if (result.success) {
        toast.success('Report sent successfully to admin email');
      } else {
        toast.error(result.error || 'Failed to send report');
      }
    } catch (error) {
      console.error('Error sending report:', error);
      toast.error('An unexpected error occurred');
    } finally {
      setIsSending(false);
    }
  };

  return (
    <button
      onClick={handleSendReport}
      disabled={isSending}
      className="inline-flex items-center justify-center gap-2 px-4 py-2 text-sm font-medium text-white bg-indigo-600 rounded-md hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
    >
      {isSending ? (
        <>
          <Loader2 className="w-4 h-4 animate-spin" />
          Sending...
        </>
      ) : (
        <>
          <Mail className="w-4 h-4" />
          Send Song Report
        </>
      )}
    </button>
  );
}
