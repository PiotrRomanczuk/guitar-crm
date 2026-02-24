import type { CronJobStatus } from '@/types/health';

export const CRON_REGISTRY: CronJobStatus[] = [
  { path: '/api/cron/drive-video-scan', schedule: '0 3 * * *', name: 'Drive Video Scan' },
  { path: '/api/cron/process-notification-queue', schedule: '*/15 * * * *', name: 'Notification Queue' },
  { path: '/api/cron/lesson-reminders', schedule: '0 10 * * *', name: 'Lesson Reminders' },
  { path: '/api/cron/assignment-due-reminders', schedule: '0 9 * * *', name: 'Assignment Due Reminders' },
  { path: '/api/cron/assignment-overdue-check', schedule: '0 18 * * *', name: 'Assignment Overdue Check' },
  { path: '/api/cron/daily-report', schedule: '0 6 * * *', name: 'Daily Report' },
  { path: '/api/cron/weekly-digest', schedule: '0 18 * * 0', name: 'Weekly Digest' },
  { path: '/api/cron/weekly-insights', schedule: '0 9 * * 1', name: 'Weekly Insights' },
  { path: '/api/cron/admin-monitoring', schedule: '0 * * * *', name: 'Admin Monitoring' },
  { path: '/api/cron/renew-webhooks', schedule: '0 0 * * *', name: 'Renew Webhooks' },
  { path: '/api/cron/update-student-status', schedule: '0 2 * * *', name: 'Update Student Status' },
];
