import type { WeeklyInsightsData } from '@/lib/services/weekly-insights';

/**
 * Format date for display
 */
function formatDate(dateString: string): string {
  const date = new Date(dateString);
  return date.toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' });
}

/**
 * Render stat card for summary section
 */
function renderStatCard(
  label: string,
  value: number | string,
  color: string = '#4f46e5'
): string {
  return `
    <div style="background-color: #f9fafb; padding: 16px; border-radius: 8px; text-align: center;">
      <div style="font-size: 28px; font-weight: 700; color: ${color};">${value}</div>
      <div style="font-size: 12px; color: #6b7280; text-transform: uppercase; letter-spacing: 0.05em; margin-top: 4px;">${label}</div>
    </div>
  `;
}

/**
 * Render alert list (at-risk students, overdue assignments)
 */
function renderAlertList(
  title: string,
  items: Array<{ text: string; subtext?: string }>,
  bgColor: string = '#fef2f2',
  icon: string = '⚠️'
): string {
  if (items.length === 0) {
    return `
      <div style="background-color: #f0fdf4; padding: 16px; border-radius: 8px; border-left: 4px solid #10b981;">
        <p style="margin: 0; color: #065f46; font-size: 14px;">✅ ${title}: None! Great job!</p>
      </div>
    `;
  }

  const listItems = items
    .slice(0, 5)
    .map(
      (item) => `
      <li style="margin-bottom: 8px;">
        <div style="font-weight: 500; color: #111827;">${item.text}</div>
        ${item.subtext ? `<div style="font-size: 12px; color: #6b7280; margin-top: 2px;">${item.subtext}</div>` : ''}
      </li>
    `
    )
    .join('');

  const moreCount =
    items.length > 5
      ? `<li style="color: #6b7280; font-style: italic;">...and ${items.length - 5} more</li>`
      : '';

  return `
    <div style="background-color: ${bgColor}; padding: 16px; border-radius: 8px; border-left: 4px solid ${bgColor === '#fef2f2' ? '#ef4444' : '#f59e0b'};">
      <h3 style="margin: 0 0 12px 0; font-size: 16px; font-weight: 600; color: #111827;">${icon} ${title} (${items.length})</h3>
      <ul style="margin: 0; padding-left: 20px; font-size: 14px; color: #374151;">
        ${listItems}
        ${moreCount}
      </ul>
    </div>
  `;
}

/**
 * Render achievement list (songs mastered, new students)
 */
function renderAchievementList(
  title: string,
  items: Array<{ text: string; subtext?: string }>,
  icon: string = '🎉'
): string {
  if (items.length === 0) {
    return '';
  }

  const listItems = items
    .slice(0, 5)
    .map(
      (item) => `
      <li style="margin-bottom: 8px;">
        <div style="font-weight: 500; color: #111827;">${item.text}</div>
        ${item.subtext ? `<div style="font-size: 12px; color: #6b7280; margin-top: 2px;">${item.subtext}</div>` : ''}
      </li>
    `
    )
    .join('');

  const moreCount =
    items.length > 5
      ? `<li style="color: #6b7280; font-style: italic;">...and ${items.length - 5} more</li>`
      : '';

  return `
    <div style="background-color: #f0fdf4; padding: 16px; border-radius: 8px; border-left: 4px solid #10b981; margin-bottom: 16px;">
      <h3 style="margin: 0 0 12px 0; font-size: 16px; font-weight: 600; color: #111827;">${icon} ${title} (${items.length})</h3>
      <ul style="margin: 0; padding-left: 20px; font-size: 14px; color: #374151;">
        ${listItems}
        ${moreCount}
      </ul>
    </div>
  `;
}

/**
 * Generate HTML email for weekly insights
 */
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

  // Format at-risk students for display
  const atRiskItems = atRiskStudents.map((student) => ({
    text: student.name,
    subtext: `Health Score: ${student.healthScore} • ${student.overdueAssignments} overdue assignments`,
  }));

  // Format overdue assignments for display
  const overdueItems = overdueAssignments.map((assignment) => ({
    text: `${assignment.studentName}: ${assignment.assignmentTitle}`,
    subtext: `Due: ${formatDate(assignment.dueDate)}`,
  }));

  // Format songs mastered for display
  const masteryItems = songsMastered.map((song) => ({
    text: `${song.studentName} mastered "${song.songTitle}"`,
    subtext: formatDate(song.masteredAt),
  }));

  // Format new students for display
  const newStudentItems = newStudents.map((student) => ({
    text: student.name,
    subtext: student.email,
  }));

  return `
    <!DOCTYPE html>
    <html>
    <head>
      <meta charset="utf-8">
      <meta name="viewport" content="width=device-width, initial-scale=1.0">
      <title>Weekly Insights</title>
    </head>
    <body style="margin: 0; padding: 0; background-color: #f3f4f6; font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Helvetica, Arial, sans-serif;">
      <div style="max-width: 600px; margin: 40px auto; background-color: #ffffff; border-radius: 8px; overflow: hidden; box-shadow: 0 4px 6px -1px rgba(0, 0, 0, 0.1);">

        <!-- Header -->
        <div style="background-color: #1f2937; padding: 24px; text-align: center;">
          <h1 style="color: #ffffff; margin: 0; font-size: 24px; font-weight: 700;">📊 Weekly Insights</h1>
          <p style="color: #9ca3af; margin: 8px 0 0 0; font-size: 14px;">${weekStart} - ${weekEnd}</p>
        </div>

        <!-- Greeting -->
        <div style="padding: 24px 24px 16px 24px;">
          <p style="margin: 0; font-size: 16px; color: #111827;">Hi ${teacherName},</p>
          <p style="margin: 8px 0 0 0; font-size: 14px; color: #6b7280; line-height: 1.6;">
            Here's a summary of your teaching activity from last week. Great work! 🎸
          </p>
        </div>

        <!-- Summary Stats -->
        <div style="padding: 0 24px 24px 24px; border-bottom: 1px solid #e5e7eb;">
          <h2 style="margin: 0 0 16px 0; font-size: 18px; font-weight: 600; color: #111827;">📈 This Week's Summary</h2>
          <div style="display: grid; grid-template-columns: repeat(2, 1fr); gap: 12px;">
            ${renderStatCard('Lessons Completed', lessonsCompleted, '#059669')}
            ${renderStatCard('New Students', newStudents.length, '#4f46e5')}
            ${renderStatCard('Songs Mastered', songsMastered.length, '#f59e0b')}
            ${renderStatCard('Lessons Cancelled', lessonsCancelled, '#ef4444')}
          </div>
        </div>

        <!-- Student Achievements -->
        ${
          masteryItems.length > 0 || newStudentItems.length > 0
            ? `
        <div style="padding: 24px; border-bottom: 1px solid #e5e7eb;">
          <h2 style="margin: 0 0 16px 0; font-size: 18px; font-weight: 600; color: #111827;">🎉 Student Achievements</h2>
          ${renderAchievementList('Songs Mastered', masteryItems, '🎵')}
          ${renderAchievementList('New Students', newStudentItems, '👋')}
        </div>
        `
            : ''
        }

        <!-- Action Items -->
        ${
          atRiskItems.length > 0 || overdueItems.length > 0
            ? `
        <div style="padding: 24px; border-bottom: 1px solid #e5e7eb;">
          <h2 style="margin: 0 0 16px 0; font-size: 18px; font-weight: 600; color: #111827;">⚡ Action Items</h2>
          <div style="display: flex; flex-direction: column; gap: 16px;">
            ${renderAlertList('At-Risk Students', atRiskItems, '#fef2f2', '⚠️')}
            ${renderAlertList('Overdue Assignments', overdueItems, '#fffbeb', '📋')}
          </div>
        </div>
        `
            : `
        <div style="padding: 24px; border-bottom: 1px solid #e5e7eb;">
          <div style="background-color: #f0fdf4; padding: 16px; border-radius: 8px; border-left: 4px solid #10b981; text-align: center;">
            <p style="margin: 0; color: #065f46; font-size: 16px; font-weight: 600;">✅ All Caught Up!</p>
            <p style="margin: 8px 0 0 0; color: #059669; font-size: 14px;">No action items this week. Great work!</p>
          </div>
        </div>
        `
        }

        <!-- CTA Button -->
        <div style="padding: 24px; text-align: center;">
          <p style="margin: 0 0 16px 0; font-size: 14px; color: #6b7280;">
            Ready to dive deeper into your data?
          </p>
          <a href="${process.env.NEXT_PUBLIC_APP_URL || 'https://app.guitarcrm.com'}/dashboard"
             style="display: inline-block; background-color: #4f46e5; color: #ffffff; padding: 12px 32px; border-radius: 6px; text-decoration: none; font-weight: 600; font-size: 14px;">
            View Full Dashboard
          </a>
        </div>

        <!-- Footer -->
        <div style="background-color: #f9fafb; padding: 16px 24px; text-align: center; border-top: 1px solid #e5e7eb;">
          <p style="margin: 0; font-size: 12px; color: #6b7280;">
            You're receiving this email because you're a teacher on Guitar CRM.
          </p>
          <p style="margin: 8px 0 0 0; font-size: 12px; color: #9ca3af;">
            © ${new Date().getFullYear()} Guitar CRM. All rights reserved.
          </p>
        </div>

      </div>
    </body>
    </html>
  `;
}
