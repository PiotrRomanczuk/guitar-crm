/**
 * Admin Song Report Email Template
 *
 * Sent to admins with song database coverage stats and missing metadata.
 */

import { SongDatabaseStats } from '@/lib/services/song-analytics';
import {
  generateBaseEmailHtml,
  createSectionHeading,
  createParagraph,
  createDivider,
} from './base-template';

function renderProgressBar(
  label: string,
  percentage: number,
  count: number,
  total: number,
  color: string
): string {
  return `
    <div style="margin-bottom: 16px;">
      <table role="presentation" style="width: 100%; border-collapse: collapse; margin-bottom: 4px;">
        <tr>
          <td style="font-size: 14px; font-weight: 500; color: #57534e;">${label}</td>
          <td style="text-align: right; font-size: 14px; font-weight: 600; color: #1c1917;">${percentage}% (${count}/${total})</td>
        </tr>
      </table>
      <div style="width: 100%; background-color: #e8e0d8; border-radius: 9999px; height: 8px;">
        <div style="width: ${percentage}%; background-color: ${color}; height: 8px; border-radius: 9999px; max-width: 100%;"></div>
      </div>
    </div>
  `;
}

function renderMissingList(
  title: string,
  items: { id: string; title: string; author: string | null }[],
  baseUrl: string
): string {
  if (items.length === 0) return '';

  const listItems = items
    .slice(0, 10)
    .map(
      (song) => `
      <li style="margin-bottom: 6px;">
        <a href="${baseUrl}/dashboard/songs/${song.id}" style="color: #b45309; text-decoration: none;">${song.title}</a>
        <span style="color: #78716c;"> by ${song.author || 'Unknown'}</span>
      </li>`
    )
    .join('');

  const moreCount = items.length > 10
    ? `<li style="color: #78716c; font-style: italic; margin-top: 4px;">...and ${items.length - 10} more</li>`
    : '';

  return `
    <div style="margin-bottom: 20px;">
      <p style="font-size: 15px; font-weight: 600; color: #dc2626; margin: 0 0 8px 0;">${title} (${items.length})</p>
      <ul style="margin: 0; padding-left: 20px; font-size: 14px; color: #57534e;">
        ${listItems}
        ${moreCount}
      </ul>
    </div>
  `;
}

export function generateAdminSongReportHtml(stats: SongDatabaseStats): string {
  const { totalSongs, coverage, counts, missing } = stats;
  const date = new Date().toLocaleDateString();

  const baseUrl =
    process.env.NEXT_PUBLIC_APP_URL ||
    process.env.NEXT_PUBLIC_API_BASE_URL_REMOTE ||
    'http://localhost:3000';

  const barColor = (pct: number) => (pct < 50 ? '#ef4444' : '#f59e0b');

  const hasMissing =
    missing.chords.length > 0 ||
    missing.youtube.length > 0 ||
    missing.ultimateGuitar.length > 0;

  const bodyContent = `
    ${createSectionHeading(`Song Database Report — ${date}`)}
    ${createParagraph(`Your song library has <strong>${totalSongs}</strong> songs. Here's the metadata coverage breakdown.`)}

    <table role="presentation" style="width: 100%; border-collapse: collapse; margin-bottom: 24px;">
      <tr>
        <td style="width: 50%; padding-right: 6px; vertical-align: top;">
          <div style="background-color: #faf5f0; padding: 16px; border-radius: 8px; text-align: center;">
            <div style="font-size: 28px; font-weight: 700; color: #f59e0b;">${totalSongs}</div>
            <div style="font-size: 12px; color: #78716c; text-transform: uppercase; letter-spacing: 0.05em; margin-top: 4px;">Total Songs</div>
          </div>
        </td>
        <td style="width: 50%; padding-left: 6px; vertical-align: top;">
          <div style="background-color: #faf5f0; padding: 16px; border-radius: 8px; text-align: center;">
            <div style="font-size: 28px; font-weight: 700; color: #059669;">${coverage.chords}%</div>
            <div style="font-size: 12px; color: #78716c; text-transform: uppercase; letter-spacing: 0.05em; margin-top: 4px;">Completion Score</div>
          </div>
        </td>
      </tr>
    </table>

    ${createSectionHeading('Metadata Coverage')}
    ${renderProgressBar('Chords / Lyrics', coverage.chords, counts.withChords, totalSongs, barColor(coverage.chords))}
    ${renderProgressBar('YouTube Links', coverage.youtube, counts.withYoutube, totalSongs, barColor(coverage.youtube))}
    ${renderProgressBar('Ultimate Guitar Links', coverage.ultimateGuitar, counts.withUltimateGuitar, totalSongs, barColor(coverage.ultimateGuitar))}
    ${renderProgressBar('Gallery Images', coverage.galleryImages, counts.withGalleryImages, totalSongs, barColor(coverage.galleryImages))}

    ${hasMissing ? `
      ${createDivider()}
      ${createSectionHeading('Action Items')}
      ${createParagraph('The following songs are missing key information. Click to edit.')}
      ${renderMissingList('Missing Chords', missing.chords, baseUrl)}
      ${renderMissingList('Missing YouTube Links', missing.youtube, baseUrl)}
      ${renderMissingList('Missing Ultimate Guitar Links', missing.ultimateGuitar, baseUrl)}
    ` : ''}
  `;

  return generateBaseEmailHtml({
    subject: `Song Database Report — ${date}`,
    preheader: `${totalSongs} songs, ${coverage.chords}% chord coverage`,
    bodyContent,
    ctaButton: {
      text: 'Go to Song Dashboard',
      url: `${baseUrl}/dashboard/songs`,
    },
  });
}
