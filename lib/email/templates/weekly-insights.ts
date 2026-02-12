/**
 * Weekly Insights Email Template
 *
 * Sent weekly to teachers with stat cards, achievements, and action items.
 */

import type { WeeklyInsightsData } from '@/lib/services/weekly-insights';
import {
  generateBaseEmailHtml,
  createSectionHeading,
  createGreeting,
  createParagraph,
  createDivider,
} from './base-template';

function formatDate(dateString: string): string {
  const date = new Date(dateString);
  return date.toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' });
}

/** Two-column stat card row using a table for email-client compatibility */
function renderStatRow(
  leftLabel: string, leftValue: number | string, leftColor: string,
  rightLabel: string, rightValue: number | string, rightColor: string
): string {
  return `
    <table role="presentation" style="width: 100%; border-collapse: collapse; margin-bottom: 12px;">
      <tr>
        <td style="width: 50%; padding-right: 6px; vertical-align: top;">
          <div style="background-color: #faf5f0; padding: 16px; border-radius: 8px; text-align: center;">
            <div style="font-size: 28px; font-weight: 700; color: ${leftColor};">${leftValue}</div>
            <div style="font-size: 12px; color: #78716c; text-transform: uppercase; letter-spacing: 0.05em; margin-top: 4px;">${leftLabel}</div>
          </div>
        </td>
        <td style="width: 50%; padding-left: 6px; vertical-align: top;">
          <div style="background-color: #faf5f0; padding: 16px; border-radius: 8px; text-align: center;">
            <div style="font-size: 28px; font-weight: 700; color: ${rightColor};">${rightValue}</div>
            <div style="font-size: 12px; color: #78716c; text-transform: uppercase; letter-spacing: 0.05em; margin-top: 4px;">${rightLabel}</div>
          </div>
        </td>
      </tr>
    </table>
  `;
}

function renderAlertList(
  title: string,
  items: Array<{ text: string; subtext?: string }>,
  bgColor: string,
  borderColor: string,
  icon: string
): string {
  if (items.length === 0) {
    return `
      <div style="background-color: #f0fdf4; padding: 16px; border-radius: 8px; border-left: 4px solid #10b981; margin-bottom: 16px;">
        <p style="margin: 0; color: #065f46; font-size: 14px;">${title}: None! Great job!</p>
      </div>
    `;
  }

  const listItems = items
    .slice(0, 5)
    .map(
      (item) => `
      <li style="margin-bottom: 8px;">
        <div style="font-weight: 500; color: #1c1917;">${item.text}</div>
        ${item.subtext ? `<div style="font-size: 12px; color: #78716c; margin-top: 2px;">${item.subtext}</div>` : ''}
      </li>`
    )
    .join('');

  const moreCount = items.length > 5
    ? `<li style="color: #78716c; font-style: italic;">...and ${items.length - 5} more</li>`
    : '';

  return `
    <div style="background-color: ${bgColor}; padding: 16px; border-radius: 8px; border-left: 4px solid ${borderColor}; margin-bottom: 16px;">
      <p style="margin: 0 0 12px 0; font-size: 16px; font-weight: 600; color: #1c1917;">${icon} ${title} (${items.length})</p>
      <ul style="margin: 0; padding-left: 20px; font-size: 14px; color: #57534e;">
        ${listItems}
        ${moreCount}
      </ul>
    </div>
  `;
}

function renderAchievementList(
  title: string,
  items: Array<{ text: string; subtext?: string }>,
  icon: string
): string {
  if (items.length === 0) return '';

  const listItems = items
    .slice(0, 5)
    .map(
      (item) => `
      <li style="margin-bottom: 8px;">
        <div style="font-weight: 500; color: #1c1917;">${item.text}</div>
        ${item.subtext ? `<div style="font-size: 12px; color: #78716c; margin-top: 2px;">${item.subtext}</div>` : ''}
      </li>`
    )
    .join('');

  const moreCount = items.length > 5
    ? `<li style="color: #78716c; font-style: italic;">...and ${items.length - 5} more</li>`
    : '';

  return `
    <div style="background-color: #f0fdf4; padding: 16px; border-radius: 8px; border-left: 4px solid #10b981; margin-bottom: 16px;">
      <p style="margin: 0 0 12px 0; font-size: 16px; font-weight: 600; color: #1c1917;">${icon} ${title} (${items.length})</p>
      <ul style="margin: 0; padding-left: 20px; font-size: 14px; color: #57534e;">
        ${listItems}
        ${moreCount}
      </ul>
    </div>
  `;
}

export function generateWeeklyInsightsHtml(data: WeeklyInsightsData): string {
  const {
    teacherName,
    dateRange,
    lessonsCompleted,
    newStudents,
    songsMastered,
    atRiskStudents,
    overdueAssignments,
    lessonsCancelled,
  } = data;

  const weekStart = formatDate(dateRange.start);
  const weekEnd = formatDate(dateRange.end);

  const atRiskItems = atRiskStudents.map((s) => ({
    text: s.name,
    subtext: `Health Score: ${s.healthScore} | ${s.overdueAssignments} overdue`,
  }));
  const overdueItems = overdueAssignments.map((a) => ({
    text: `${a.studentName}: ${a.assignmentTitle}`,
    subtext: `Due: ${formatDate(a.dueDate)}`,
  }));
  const masteryItems = songsMastered.map((s) => ({
    text: `${s.studentName} mastered "${s.songTitle}"`,
    subtext: formatDate(s.masteredAt),
  }));
  const newStudentItems = newStudents.map((s) => ({
    text: s.name,
    subtext: s.email,
  }));

  const hasAchievements = masteryItems.length > 0 || newStudentItems.length > 0;
  const hasActionItems = atRiskItems.length > 0 || overdueItems.length > 0;

  const bodyContent = `
    ${createSectionHeading(`Weekly Insights: ${weekStart} - ${weekEnd}`)}
    ${createGreeting(teacherName)}
    ${createParagraph("Here's a summary of your teaching activity from last week.")}

    ${renderStatRow(
      'Lessons Completed', lessonsCompleted, '#059669',
      'New Students', newStudents.length, '#b45309'
    )}
    ${renderStatRow(
      'Songs Mastered', songsMastered.length, '#f59e0b',
      'Lessons Cancelled', lessonsCancelled, '#ef4444'
    )}

    ${hasAchievements ? `
      ${createDivider()}
      ${createSectionHeading('Student Achievements')}
      ${renderAchievementList('Songs Mastered', masteryItems, '🎵')}
      ${renderAchievementList('New Students', newStudentItems, '👋')}
    ` : ''}

    ${createDivider()}
    ${hasActionItems ? `
      ${createSectionHeading('Action Items')}
      ${renderAlertList('At-Risk Students', atRiskItems, '#fef2f2', '#ef4444', '⚠️')}
      ${renderAlertList('Overdue Assignments', overdueItems, '#fffbeb', '#f59e0b', '📋')}
    ` : `
      <div style="background-color: #f0fdf4; padding: 20px; border-radius: 8px; border-left: 4px solid #10b981; text-align: center;">
        <p style="margin: 0; color: #065f46; font-size: 16px; font-weight: 600;">All Caught Up!</p>
        <p style="margin: 8px 0 0 0; color: #059669; font-size: 14px;">No action items this week. Great work!</p>
      </div>
    `}
  `;

  return generateBaseEmailHtml({
    subject: `Weekly Insights: ${weekStart} - ${weekEnd}`,
    preheader: `${lessonsCompleted} lessons, ${songsMastered.length} songs mastered this week`,
    bodyContent,
    footerNote: 'Ready to dive deeper into your data?',
    ctaButton: {
      text: 'View Full Dashboard',
      url: `${process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3000'}/dashboard`,
    },
  });
}
