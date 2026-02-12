#!/usr/bin/env tsx

/**
 * Send notification emails one by one with 10s delay between each.
 * Usage: npx tsx scripts/testing/send-one-by-one.ts
 */

import * as dotenv from 'dotenv';
import path from 'path';

dotenv.config({ path: path.resolve(process.cwd(), '.env.local') });

import type { NotificationType } from '../../types/notifications';

const TARGET = 'p.romanczuk@gmail.com';

const SAMPLE_DATA: Record<string, Record<string, unknown>> = {
  lesson_reminder_24h: {
    studentName: 'Piotr',
    lessonDate: 'Wednesday, February 12, 2026',
    lessonTime: '18:00',
    location: 'Online (Zoom)',
    agenda: 'Reviewing fingerpicking patterns and starting "Blackbird".',
  },
  lesson_recap: {
    studentName: 'Piotr',
    lessonDate: 'February 12, 2026',
    lessonTitle: 'Advanced Fingerstyle Techniques',
    notes: 'Great progress today! Focus on keeping your thumb independent.',
    songs: [
      { id: 'song-1', title: 'Blackbird', artist: 'The Beatles', status: 'In Progress', notes: 'Watch the timing on the bridge.' },
      { id: 'song-2', title: 'Neon', artist: 'John Mayer', status: 'Learning', notes: 'Just the main riff for now.' },
      { id: 'song-3', title: 'Wonderwall', artist: 'Oasis', status: 'Mastered' },
    ],
  },
  lesson_cancelled: {
    studentName: 'Piotr',
    teacherName: 'Guitar Teacher',
    lessonDate: 'February 14, 2026',
    lessonTime: '16:00',
    reason: 'Teacher is feeling unwell. We will reschedule for next week.',
  },
  lesson_rescheduled: {
    studentName: 'Piotr',
    teacherName: 'Guitar Teacher',
    oldDate: 'February 14, 2026',
    oldTime: '16:00',
    newDate: 'February 16, 2026',
    newTime: '17:00',
  },
  assignment_created: {
    studentName: 'Piotr',
    assignmentTitle: 'Fingerpicking Pattern #3',
    assignmentDescription: 'Practice the Travis picking pattern. Start at 60 BPM.',
    dueDate: 'February 19, 2026',
    teacherName: 'Guitar Teacher',
  },
  assignment_due_reminder: {
    studentName: 'Piotr',
    assignmentTitle: 'Practice Major Scales in All Keys',
    dueDate: 'February 15, 2026',
    assignmentDescription: 'Play each major scale at 80 BPM ascending and descending.',
    assignmentLink: '#',
  },
  assignment_overdue_alert: {
    studentName: 'Piotr',
    assignmentTitle: 'Learn "Hotel California" Intro',
    dueDate: 'February 10, 2026',
    daysOverdue: 2,
    assignmentLink: '#',
  },
  assignment_completed: {
    studentName: 'Piotr',
    assignmentTitle: 'Barre Chord Transitions',
    completedDate: 'February 12, 2026',
    teacherName: 'Guitar Teacher',
  },
  song_mastery_achievement: {
    studentName: 'Piotr',
    songTitle: 'Blackbird',
    songArtist: 'The Beatles',
    masteredDate: 'February 12, 2026',
    totalSongsMastered: 7,
  },
  milestone_reached: {
    studentName: 'Piotr',
    milestone: '10 Lessons Completed',
    milestoneDescription: "You've completed your first 10 guitar lessons!",
    achievedDate: 'February 12, 2026',
  },
  student_welcome: {
    studentName: 'Piotr',
    teacherName: 'Guitar Teacher',
    loginLink: '#',
    firstLessonDate: 'February 15, 2026 at 16:00',
  },
  trial_ending_reminder: {
    studentName: 'Piotr',
    trialEndDate: 'February 20, 2026',
    daysRemaining: 8,
  },
  teacher_daily_summary: {
    teacherName: 'Piotr',
    date: 'February 12, 2026',
    upcomingLessons: [
      { studentName: 'Alice Johnson', time: '14:00', title: 'Beginner Guitar Basics' },
      { studentName: 'Bob Smith', time: '16:00', title: 'Intermediate Blues' },
      { studentName: 'Carol Davis', time: '18:00', title: 'Advanced Fingerstyle' },
    ],
    completedLessons: 2,
    pendingAssignments: 5,
    recentAchievements: [
      { studentName: 'Alice Johnson', achievement: 'Mastered "Smoke on the Water"' },
      { studentName: 'Bob Smith', achievement: 'Completed 5 lessons' },
    ],
  },
  weekly_progress_digest: {
    recipientName: 'Piotr',
    weekStart: '2026-02-03',
    weekEnd: '2026-02-09',
    lessonsCompleted: 3,
    songsMastered: 1,
    practiceTime: 240,
    highlights: ['Mastered "Blackbird"', 'Started learning barre chords', 'Improved picking speed by 20%'],
    upcomingLessons: [
      { date: 'February 12, 2026', title: 'Fingerstyle Patterns' },
      { date: 'February 14, 2026', title: 'Music Theory: Chord Progressions' },
    ],
  },
  calendar_conflict_alert: {
    teacherName: 'Piotr',
    conflictDate: 'February 14, 2026',
    conflictTime: '16:00',
    lesson1: 'Alice Johnson — Beginner Guitar Basics',
    lesson2: 'Bob Smith — Intermediate Blues',
  },
  webhook_expiration_notice: {
    teacherName: 'Piotr',
    serviceName: 'Google Calendar',
    expirationDate: 'February 20, 2026',
  },
  admin_error_alert: {
    adminName: 'Piotr',
    errorType: 'SMTP_CONNECTION_FAILED',
    errorMessage: 'Connection to smtp.gmail.com:587 timed out after 30 seconds.',
    timestamp: new Date().toISOString(),
    affectedService: 'Email Notifications',
    stackTrace:
      'Error: Connection timeout\n  at SMTPClient.connect (lib/email/smtp-client.ts:42)',
  },
};

const LABELS: Record<string, string> = {
  lesson_reminder_24h: 'Lesson Reminder',
  lesson_recap: 'Lesson Recap',
  lesson_cancelled: 'Lesson Cancelled',
  lesson_rescheduled: 'Lesson Rescheduled',
  assignment_created: 'Assignment Created',
  assignment_due_reminder: 'Assignment Due Soon',
  assignment_overdue_alert: 'Assignment Overdue',
  assignment_completed: 'Assignment Completed',
  song_mastery_achievement: 'Song Mastery',
  milestone_reached: 'Milestone Reached',
  student_welcome: 'Student Welcome',
  trial_ending_reminder: 'Trial Ending',
  teacher_daily_summary: 'Teacher Daily Summary',
  weekly_progress_digest: 'Weekly Progress',
  calendar_conflict_alert: 'Calendar Conflict',
  webhook_expiration_notice: 'Webhook Expiring',
  admin_error_alert: 'Admin Error Alert',
};

async function main() {
  if (!process.env.GMAIL_USER || !process.env.GMAIL_APP_PASSWORD) {
    console.error('Missing GMAIL_USER or GMAIL_APP_PASSWORD in .env.local');
    process.exit(1);
  }

  const { renderNotificationHtml } = await import('../../lib/email/render-notification');
  const { default: transporter } = await import('../../lib/email/smtp-client');

  const recipient = { full_name: 'Piotr', email: TARGET };
  const types = Object.keys(SAMPLE_DATA);
  const total = types.length;
  let sent = 0;
  let failed = 0;

  console.log(`\nSending ${total} emails to ${TARGET} (10s between each)\n`);

  for (const type of types) {
    const num = sent + failed + 1;
    const label = LABELS[type] || type;

    try {
      const html = renderNotificationHtml(
        type as NotificationType,
        SAMPLE_DATA[type],
        recipient
      );

      await transporter.sendMail({
        from: `"Strummy" <${process.env.GMAIL_USER}>`,
        to: TARGET,
        subject: `[${num}/${total}] ${label}`,
        html,
      });

      console.log(`  ${num}/${total} sent: ${label}`);
      sent++;
    } catch (err) {
      const msg = err instanceof Error ? err.message : String(err);
      console.error(`  ${num}/${total} FAILED: ${label} — ${msg}`);
      failed++;
    }

    // 10 second delay between emails
    if (num < total) {
      await new Promise((r) => setTimeout(r, 10_000));
    }
  }

  console.log(`\nDone! Sent: ${sent}, Failed: ${failed}`);
}

main().catch(console.error);
