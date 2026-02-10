/**
 * Weekly Progress Digest Email Template
 *
 * Sent to students at the end of each week summarizing their progress.
 */

import {
  generateBaseEmailHtml,
  createSectionHeading,
  createGreeting,
  createParagraph,
  createCardSection,
  createSubsectionHeading,
} from './base-template';
import type { WeeklyProgressDigestData } from '@/types/notifications';

export function generateWeeklyProgressDigestHtml(data: WeeklyProgressDigestData): string {
  const {
    recipientName,
    weekStart,
    weekEnd,
    lessonsCompleted,
    songsMastered,
    practiceTime,
    highlights,
    upcomingLessons,
  } = data;

  const bodyContent = `
    ${createSectionHeading('Your Weekly Progress Report')}
    ${createGreeting(recipientName)}
    ${createParagraph(
      `Here's a summary of your progress from ${weekStart} to ${weekEnd}. Great work this week!`
    )}

    <!-- Weekly Stats -->
    <div style="margin-bottom: 24px;">
      <div style="display: grid; grid-template-columns: repeat(3, 1fr); gap: 12px;">
        <div style="padding: 20px; background: linear-gradient(135deg, #3b82f6 0%, #2563eb 100%); border-radius: 8px; text-align: center;">
          <p style="margin: 0 0 4px 0; font-size: 28px; font-weight: 700; color: #ffffff;">
            ${lessonsCompleted}
          </p>
          <p style="margin: 0; font-size: 12px; color: #dbeafe; font-weight: 500; text-transform: uppercase; letter-spacing: 0.05em;">
            Lessons
          </p>
        </div>
        <div style="padding: 20px; background: linear-gradient(135deg, #10b981 0%, #059669 100%); border-radius: 8px; text-align: center;">
          <p style="margin: 0 0 4px 0; font-size: 28px; font-weight: 700; color: #ffffff;">
            ${songsMastered}
          </p>
          <p style="margin: 0; font-size: 12px; color: #d1fae5; font-weight: 500; text-transform: uppercase; letter-spacing: 0.05em;">
            Songs
          </p>
        </div>
        <div style="padding: 20px; background: linear-gradient(135deg, #8b5cf6 0%, #7c3aed 100%); border-radius: 8px; text-align: center;">
          <p style="margin: 0 0 4px 0; font-size: 28px; font-weight: 700; color: #ffffff;">
            ${practiceTime}h
          </p>
          <p style="margin: 0; font-size: 12px; color: #ede9fe; font-weight: 500; text-transform: uppercase; letter-spacing: 0.05em;">
            Practice
          </p>
        </div>
      </div>
    </div>

    ${
      highlights.length > 0
        ? `
    <!-- Weekly Highlights -->
    ${createCardSection(`
      ${createSubsectionHeading('This Week\'s Highlights ✨')}
      <ul style="margin: 0; padding-left: 24px; color: #52525b; line-height: 1.8; font-size: 15px;">
        ${highlights.map((highlight) => `<li>${highlight}</li>`).join('')}
      </ul>
    `)}
    `
        : ''
    }

    ${
      upcomingLessons.length > 0
        ? `
    <!-- Upcoming Lessons -->
    ${createCardSection(`
      ${createSubsectionHeading('Coming Up Next Week')}
      <div style="border: 1px solid #e4e4e7; border-radius: 8px; overflow: hidden;">
        <table style="width: 100%; border-collapse: collapse;">
          ${upcomingLessons
            .map(
              (lesson, index) => `
            <tr style="${index !== upcomingLessons.length - 1 ? 'border-bottom: 1px solid #e4e4e7;' : ''}">
              <td style="padding: 16px;">
                <div style="color: #18181b; font-weight: 600; font-size: 15px;">
                  ${lesson.date}
                </div>
                <div style="color: #71717a; font-size: 14px; margin-top: 2px;">
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

    <div style="text-align: center; margin-top: 32px; padding: 20px; background-color: #fef3c7; border-radius: 8px; border: 1px solid #fde68a;">
      <p style="margin: 0; color: #78350f; font-size: 15px; font-weight: 500;">
        💪 Keep up the fantastic work! Consistency is the key to mastery.
      </p>
    </div>
  `;

  return generateBaseEmailHtml({
    subject: 'Your Weekly Progress Report',
    preheader: `${lessonsCompleted} lessons, ${songsMastered} songs mastered this week`,
    bodyContent,
    footerNote: 'This is an opt-in digest. Manage your preferences anytime.',
  });
}
