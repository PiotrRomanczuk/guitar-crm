/**
 * Lesson Recap Email Template
 *
 * Sent after a lesson is completed with summary, notes, and songs practiced.
 */

import {
  generateBaseEmailHtml,
  createSectionHeading,
  createGreeting,
  createParagraph,
  createCardSection,
  createDetailRow,
  createSubsectionHeading,
  createStatusBadge,
} from './base-template';

export interface LessonEmailData {
  studentName: string;
  lessonDate: string;
  lessonTitle?: string | null;
  notes?: string | null;
  songs?: {
    id?: string;
    title: string;
    artist: string;
    status: string;
    notes?: string | null;
  }[];
}

function getStatusColor(status: string): 'success' | 'warning' | 'info' | 'default' {
  const lower = status.toLowerCase();
  if (lower === 'mastered' || lower === 'completed') return 'success';
  if (lower === 'in progress' || lower === 'learning') return 'warning';
  if (lower === 'new' || lower === 'assigned') return 'info';
  return 'default';
}

function renderSongsTable(
  songs: NonNullable<LessonEmailData['songs']>,
  baseUrl: string
): string {
  const rows = songs
    .map(
      (song, index) => `
      <tr style="${index !== songs.length - 1 ? 'border-bottom: 1px solid #e8e0d8;' : ''}">
        <td style="padding: 14px 16px;">
          <div style="color: #1c1917; font-weight: 600; font-size: 15px;">
            ${
              song.id
                ? `<a href="${baseUrl}/dashboard/songs/${song.id}" style="color: #b45309; text-decoration: none;">${song.title}</a>`
                : song.title
            }
          </div>
          <div style="color: #78716c; font-size: 14px; margin-top: 2px;">${song.artist}</div>
          ${song.notes ? `<div style="color: #57534e; font-size: 13px; margin-top: 6px; font-style: italic;">${song.notes}</div>` : ''}
        </td>
        <td style="text-align: right; vertical-align: top; padding: 14px 16px; white-space: nowrap;">
          ${createStatusBadge(song.status, getStatusColor(song.status))}
        </td>
      </tr>`
    )
    .join('');

  return `
    <div style="margin-bottom: 24px;">
      ${createSubsectionHeading('Songs Practiced')}
      <div style="border: 1px solid #e8e0d8; border-radius: 8px; overflow: hidden;">
        <table style="width: 100%; border-collapse: collapse; background-color: #ffffff;" role="presentation">
          ${rows}
        </table>
      </div>
    </div>
  `;
}

export function generateLessonRecapHtml(data: LessonEmailData): string {
  const { studentName, lessonDate, lessonTitle, notes, songs } = data;

  let baseUrl =
    process.env.NEXT_PUBLIC_APP_URL ||
    process.env.NEXT_PUBLIC_API_BASE_URL_REMOTE ||
    'http://localhost:3000';
  if (baseUrl.endsWith('/')) baseUrl = baseUrl.slice(0, -1);

  const bodyContent = `
    ${createSectionHeading('Lesson Summary')}
    ${createGreeting(studentName)}
    ${createParagraph(
      `Here's a summary of your lesson on <strong>${lessonDate}</strong>.`
    )}

    ${lessonTitle ? createCardSection(createDetailRow('Topic', lessonTitle)) : ''}

    ${
      notes
        ? `
      ${createSubsectionHeading("Teacher's Notes")}
      <div style="color: #57534e; line-height: 1.6; white-space: pre-wrap; background-color: #ffffff; border: 1px solid #e8e0d8; padding: 16px; border-radius: 8px; font-size: 15px; margin-bottom: 24px;">${notes}</div>
    `
        : ''
    }

    ${songs && songs.length > 0 ? renderSongsTable(songs, baseUrl) : ''}
  `;

  return generateBaseEmailHtml({
    subject: `Lesson Summary - ${lessonDate}`,
    preheader: `Your lesson recap for ${lessonDate}${lessonTitle ? ` — ${lessonTitle}` : ''}`,
    bodyContent,
    footerNote: 'Keep practicing!',
    ctaButton: {
      text: 'View Dashboard',
      url: `${baseUrl}/dashboard`,
    },
  });
}
