/**
 * Teacher Daily Summary Email Template
 *
 * Sent to teachers each morning with the day's schedule and pending items.
 */

import {
  generateBaseEmailHtml,
  createSectionHeading,
  createGreeting,
  createParagraph,
  createCardSection,
  createSubsectionHeading,
} from './base-template';
import type { TeacherDailySummaryData } from '@/types/notifications';

export function generateTeacherDailySummaryHtml(data: TeacherDailySummaryData): string {
  const {
    teacherName,
    date,
    upcomingLessons,
    completedLessons,
    pendingAssignments,
    recentAchievements,
  } = data;

  const bodyContent = `
    ${createSectionHeading(`Daily Summary - ${date}`)}
    ${createGreeting(teacherName)}
    ${createParagraph("Here's your summary for today:")}

    <!-- Quick Stats -->
    <div style="display: table; width: 100%; margin-bottom: 24px;">
      <div style="display: table-row;">
        <div style="display: table-cell; padding: 16px; background-color: #f0f9ff; border-radius: 8px; border: 1px solid #bae6fd; text-align: center; width: 33%;">
          <p style="margin: 0 0 4px 0; font-size: 24px; font-weight: 700; color: #0369a1;">
            ${upcomingLessons.length}
          </p>
          <p style="margin: 0; font-size: 13px; color: #0c4a6e; font-weight: 500;">
            Lessons Today
          </p>
        </div>
        <div style="display: table-cell; padding: 0 8px;"></div>
        <div style="display: table-cell; padding: 16px; background-color: #fef3c7; border-radius: 8px; border: 1px solid #fde68a; text-align: center; width: 33%;">
          <p style="margin: 0 0 4px 0; font-size: 24px; font-weight: 700; color: #b45309;">
            ${pendingAssignments}
          </p>
          <p style="margin: 0; font-size: 13px; color: #78350f; font-weight: 500;">
            Pending Items
          </p>
        </div>
        <div style="display: table-cell; padding: 0 8px;"></div>
        <div style="display: table-cell; padding: 16px; background-color: #f0fdf4; border-radius: 8px; border: 1px solid #bbf7d0; text-align: center; width: 33%;">
          <p style="margin: 0 0 4px 0; font-size: 24px; font-weight: 700; color: #15803d;">
            ${completedLessons}
          </p>
          <p style="margin: 0; font-size: 13px; color: #166534; font-weight: 500;">
            Completed
          </p>
        </div>
      </div>
    </div>

    ${
      upcomingLessons.length > 0
        ? `
    <!-- Upcoming Lessons -->
    ${createCardSection(`
      ${createSubsectionHeading('Today\'s Lessons')}
      <div style="border: 1px solid #e4e4e7; border-radius: 8px; overflow: hidden;">
        <table style="width: 100%; border-collapse: collapse;">
          ${upcomingLessons
            .map(
              (lesson, index) => `
            <tr style="${index !== upcomingLessons.length - 1 ? 'border-bottom: 1px solid #e4e4e7;' : ''}">
              <td style="padding: 16px;">
                <div style="color: #18181b; font-weight: 600; font-size: 15px;">
                  ${lesson.time}
                </div>
                <div style="color: #52525b; font-size: 14px; margin-top: 4px;">
                  ${lesson.studentName}
                </div>
              </td>
              <td style="text-align: right; padding: 16px;">
                <div style="color: #71717a; font-size: 14px;">
                  ${lesson.title || 'Regular Lesson'}
                </div>
              </td>
            </tr>
          `
            )
            .join('')}
        </table>
      </div>
    `)}
    `
        : ''
    }

    ${
      recentAchievements.length > 0
        ? `
    <!-- Recent Achievements -->
    ${createCardSection(`
      ${createSubsectionHeading('Recent Student Achievements 🎉')}
      <ul style="margin: 0; padding: 0; list-style: none;">
        ${recentAchievements
          .map(
            (achievement) => `
          <li style="padding: 12px 0; border-bottom: 1px dashed #e4e4e7;">
            <div style="color: #18181b; font-weight: 500; font-size: 15px;">
              ${achievement.studentName}
            </div>
            <div style="color: #52525b; font-size: 14px; margin-top: 4px;">
              ${achievement.achievement}
            </div>
          </li>
        `
          )
          .join('')}
      </ul>
    `)}
    `
        : ''
    }

    ${createParagraph('Have a great teaching day! 🎸')}
  `;

  return generateBaseEmailHtml({
    subject: `Your Daily Summary - ${date}`,
    preheader: `${upcomingLessons.length} lessons today`,
    bodyContent,
    footerNote: 'This is an opt-in digest. Manage your preferences anytime.',
  });
}
