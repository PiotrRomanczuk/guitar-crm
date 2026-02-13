/**
 * Song Mastery Achievement Email Template
 *
 * Sent when a student masters a song to celebrate their achievement.
 */

import {
  generateBaseEmailHtml,
  createSectionHeading,
  createGreeting,
  createParagraph,
  createCardSection,
  createStatusBadge,
} from './base-template';
import type { SongMasteryAchievementData } from '@/types/notifications';

export function generateSongMasteryAchievementHtml(data: SongMasteryAchievementData): string {
  const { studentName, songTitle, songArtist, masteredDate, totalSongsMastered } = data;

  const bodyContent = `
    ${createSectionHeading('Congratulations!')}
    ${createGreeting(studentName)}

    <div style="text-align: center; margin: 32px 0;">
      <div style="display: inline-block; padding: 24px; background: linear-gradient(135deg, #f59e0b 0%, #d97706 100%); border-radius: 12px; box-shadow: 0 4px 6px -1px rgba(120, 80, 40, 0.15);">
        <p style="margin: 0; font-size: 48px; line-height: 1;">🎸</p>
      </div>
    </div>

    ${createParagraph(
      `You've just mastered <strong>"${songTitle}"</strong> by ${songArtist}! This is a fantastic achievement and a testament to your hard work and dedication.`
    )}

    ${createCardSection(`
      <div style="text-align: center; margin-bottom: 20px;">
        <h3 style="margin: 0 0 8px 0; color: #1c1917; font-size: 20px; font-weight: 700;">
          "${songTitle}"
        </h3>
        <p style="margin: 0; color: #78716c; font-size: 16px;">
          by ${songArtist}
        </p>
      </div>

      <div style="text-align: center; padding-top: 20px; border-top: 1px solid #e8e0d8;">
        <p style="margin: 0 0 8px 0; font-size: 14px; color: #78716c;">
          Mastered on ${masteredDate}
        </p>
        ${createStatusBadge('Mastered', 'success')}
      </div>
    `)}

    ${createParagraph(
      `You've now mastered <strong>${totalSongsMastered}</strong> ${totalSongsMastered === 1 ? 'song' : 'songs'} total. Keep up the amazing work and continue building your repertoire!`
    )}

    <div style="text-align: center; margin-top: 32px; padding: 20px; background-color: #f0fdf4; border-radius: 8px; border: 1px solid #bbf7d0;">
      <p style="margin: 0; color: #15803d; font-size: 15px; font-weight: 500;">
        "The expert in anything was once a beginner."
      </p>
    </div>
  `;

  return generateBaseEmailHtml({
    subject: `Congratulations! You Mastered "${songTitle}"`,
    preheader: `You've just mastered ${songTitle} by ${songArtist}!`,
    bodyContent,
    footerNote: 'Keep rocking!',
  });
}
