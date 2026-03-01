export type AuthEventType =
  | 'signup_attempted' | 'signup_succeeded' | 'signup_failed'
  | 'email_confirmed'
  | 'invite_sent' | 'invite_failed'
  | 'user_created_by_admin' | 'shadow_user_created'
  | 'signin_succeeded' | 'signin_failed' | 'signin_locked' | 'signin_rate_limited'
  | 'password_reset_requested' | 'password_reset_failed'
  | 'resend_verification_requested' | 'resend_verification_failed';

export type AuthEmailStatus = 'not_applicable' | 'sent' | 'failed' | 'skipped';

export interface AuthEvent {
  id: string;
  event_type: AuthEventType;
  occurred_at: string;
  user_email: string | null;
  user_id: string | null;
  actor_id: string | null;
  ip_address: string | null;
  success: boolean;
  error_message: string | null;
  email_status: AuthEmailStatus;
  email_error: string | null;
  metadata: Record<string, unknown> | null;
}

export const EVENT_TYPE_LABELS: Record<AuthEventType, string> = {
  signup_attempted: 'Signup Attempted',
  signup_succeeded: 'Signup Succeeded',
  signup_failed: 'Signup Failed',
  email_confirmed: 'Email Confirmed',
  invite_sent: 'Invite Sent',
  invite_failed: 'Invite Failed',
  user_created_by_admin: 'Admin Created User',
  shadow_user_created: 'Shadow User Created',
  signin_succeeded: 'Sign-in OK',
  signin_failed: 'Sign-in Failed',
  signin_locked: 'Account Locked',
  signin_rate_limited: 'Rate Limited',
  password_reset_requested: 'Password Reset',
  password_reset_failed: 'Reset Failed',
  resend_verification_requested: 'Resend Verification',
  resend_verification_failed: 'Resend Failed',
};

export const EVENT_TYPE_GROUPS: Record<string, AuthEventType[]> = {
  Signup: ['signup_attempted', 'signup_succeeded', 'signup_failed', 'email_confirmed'],
  Invitation: ['invite_sent', 'invite_failed', 'user_created_by_admin', 'shadow_user_created'],
  'Sign-in': ['signin_succeeded', 'signin_failed', 'signin_locked', 'signin_rate_limited'],
  Password: ['password_reset_requested', 'password_reset_failed'],
  Resend: ['resend_verification_requested', 'resend_verification_failed'],
};

export function getEventBadgeColor(eventType: AuthEventType): string {
  if (eventType.includes('succeeded') || eventType === 'email_confirmed' ||
      eventType === 'invite_sent' || eventType === 'signin_succeeded') {
    return 'bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-400';
  }
  if (eventType.includes('failed') || eventType === 'signin_locked') {
    return 'bg-red-100 text-red-800 dark:bg-red-900/30 dark:text-red-400';
  }
  if (eventType === 'signin_rate_limited') {
    return 'bg-orange-100 text-orange-800 dark:bg-orange-900/30 dark:text-orange-400';
  }
  if (eventType === 'shadow_user_created' || eventType === 'user_created_by_admin') {
    return 'bg-blue-100 text-blue-800 dark:bg-blue-900/30 dark:text-blue-400';
  }
  return 'bg-gray-100 text-gray-800 dark:bg-gray-800 dark:text-gray-300';
}

export function getEmailStatusBadgeColor(status: AuthEmailStatus): string {
  switch (status) {
    case 'sent': return 'bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-400';
    case 'failed': return 'bg-red-100 text-red-800 dark:bg-red-900/30 dark:text-red-400';
    case 'skipped': return 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900/30 dark:text-yellow-400';
    default: return 'bg-gray-100 text-gray-600 dark:bg-gray-800 dark:text-gray-400';
  }
}

export function formatEventTime(dateStr: string): string {
  return new Date(dateStr).toLocaleString('en-US', {
    month: 'short',
    day: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
    second: '2-digit',
  });
}
