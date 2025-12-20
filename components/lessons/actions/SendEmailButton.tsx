'use client';

import { useState } from 'react';
import { sendLessonSummaryEmail } from '@/app/dashboard/lessons/actions';
import { toast } from 'sonner';

interface SendEmailButtonProps {
  lessonId: string;
}

export default function SendEmailButton({ lessonId }: SendEmailButtonProps) {
  const [isSending, setIsSending] = useState(false);

  const handleSendEmail = async () => {
    setIsSending(true);
    try {
      const result = await sendLessonSummaryEmail(lessonId);
      if (result.success) {
        toast.success('Email sent successfully');
      } else {
        toast.error(result.error || 'Failed to send email');
      }
    } catch (error) {
      console.error('Error sending email:', error);
      toast.error('An unexpected error occurred');
    } finally {
      setIsSending(false);
    }
  };

  return (
    <button
      onClick={handleSendEmail}
      disabled={isSending}
      className="px-4 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2"
      data-testid="send-email-button"
    >
      {isSending ? (
        <>
          <span className="animate-spin h-4 w-4 border-2 border-white border-t-transparent rounded-full"></span>
          Sending...
        </>
      ) : (
        <>
          <svg
            xmlns="http://www.w3.org/2000/svg"
            width="16"
            height="16"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="2"
            strokeLinecap="round"
            strokeLinejoin="round"
          >
            <rect width="20" height="16" x="2" y="4" rx="2" />
            <path d="m22 7-8.97 5.7a1.94 1.94 0 0 1-2.06 0L2 7" />
          </svg>
          Send Email
        </>
      )}
    </button>
  );
}
