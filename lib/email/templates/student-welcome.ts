/**
 * Student Welcome Email Template
 *
 * Sent when a new student account is created.
 */

import {
  generateBaseEmailHtml,
  createSectionHeading,
  createGreeting,
  createParagraph,
  createCardSection,
  createDetailRow,
} from './base-template';
import type { StudentWelcomeData } from '@/types/notifications';

export function generateStudentWelcomeHtml(data: StudentWelcomeData): string {
  const { studentName, teacherName, loginLink, firstLessonDate } = data;

  const bodyContent = `
    ${createSectionHeading('Welcome to Strummy!')}
    ${createGreeting(studentName)}
    ${createParagraph(
      `We're thrilled to have you join us! You've been enrolled with ${teacherName} and are all set to begin your guitar learning journey.`
    )}

    ${createCardSection(`
      <div style="text-align: center; margin-bottom: 20px;">
        <h3 style="margin: 0 0 12px 0; color: #1c1917; font-size: 18px; font-weight: 600;">
          Getting Started
        </h3>
        <p style="margin: 0; color: #57534e; line-height: 1.6; font-size: 15px;">
          Your account is ready! Log in to access your dashboard, view lessons, track progress, and communicate with your teacher.
        </p>
      </div>

      ${firstLessonDate ? createDetailRow('First Lesson', firstLessonDate) : ''}
      ${createDetailRow('Your Teacher', teacherName)}
    `)}

    ${createParagraph(
      "On your dashboard, you'll be able to:"
    )}

    <ul style="margin: 0 0 24px 0; padding-left: 24px; color: #57534e; line-height: 1.8; font-size: 15px;">
      <li>View your upcoming lessons and lesson history</li>
      <li>Track songs you're learning and your progress</li>
      <li>Complete assignments from your teacher</li>
      <li>Communicate with your teacher</li>
      <li>Monitor your practice time and achievements</li>
    </ul>

    ${createParagraph(
      "We're excited to support you on your musical journey. Practice regularly, stay curious, and don't hesitate to ask your teacher questions!"
    )}
  `;

  return generateBaseEmailHtml({
    subject: 'Welcome to Strummy Guitar CRM!',
    preheader: `Get started with ${teacherName} and begin your guitar journey`,
    bodyContent,
    footerNote: 'Happy strumming!',
    ctaButton: {
      text: 'Log In to Your Dashboard',
      url: loginLink,
    },
  });
}
