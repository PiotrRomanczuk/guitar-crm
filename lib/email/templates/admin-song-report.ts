import { SongDatabaseStats } from '@/lib/services/song-analytics';

export function generateAdminSongReportHtml(stats: SongDatabaseStats): string {
  const { totalSongs, coverage, counts, missing } = stats;
  const date = new Date().toLocaleDateString();

  // Helper for progress bars
  const renderProgressBar = (label: string, percentage: number, count: number, color: string = '#4f46e5') => `
    <div style="margin-bottom: 16px;">
      <div style="display: flex; justify-content: space-between; margin-bottom: 4px;">
        <span style="font-size: 14px; font-weight: 500; color: #374151;">${label}</span>
        <span style="font-size: 14px; font-weight: 600; color: #111827;">${percentage}% (${count}/${totalSongs})</span>
      </div>
      <div style="width: 100%; background-color: #e5e7eb; border-radius: 9999px; height: 8px;">
        <div style="width: ${percentage}%; background-color: ${color}; height: 8px; border-radius: 9999px;"></div>
      </div>
    </div>
  `;

  // Helper for missing items list
  const renderMissingList = (title: string, items: { id: string; title: string; author: string | null }[]) => {
    if (items.length === 0) return '';
    
    const listItems = items.slice(0, 10).map(song => `
      <li style="margin-bottom: 4px;">
        <a href="${process.env.NEXT_PUBLIC_APP_URL}/dashboard/songs/${song.id}" style="color: #4f46e5; text-decoration: none; hover: underline;">
          ${song.title}
        </a> 
        <span style="color: #6b7280;">by ${song.author || 'Unknown'}</span>
      </li>
    `).join('');

    const moreCount = items.length > 10 ? `<li style="color: #6b7280; font-style: italic; margin-top: 4px;">...and ${items.length - 10} more</li>` : '';

    return `
      <div style="margin-bottom: 24px;">
        <h3 style="font-size: 16px; font-weight: 600; color: #b91c1c; margin-bottom: 8px;">${title} (${items.length})</h3>
        <ul style="margin: 0; padding-left: 20px; font-size: 14px; color: #374151;">
          ${listItems}
          ${moreCount}
        </ul>
      </div>
    `;
  };

  return `
    <!DOCTYPE html>
    <html>
    <head>
      <meta charset="utf-8">
      <meta name="viewport" content="width=device-width, initial-scale=1.0">
      <title>Song Database Report</title>
    </head>
    <body style="margin: 0; padding: 0; background-color: #f3f4f6; font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Helvetica, Arial, sans-serif;">
      <div style="max-width: 600px; margin: 40px auto; background-color: #ffffff; border-radius: 8px; overflow: hidden; box-shadow: 0 4px 6px -1px rgba(0, 0, 0, 0.1);">
        
        <!-- Header -->
        <div style="background-color: #1f2937; padding: 24px; text-align: center;">
          <h1 style="color: #ffffff; margin: 0; font-size: 24px; font-weight: 700;">Guitar CRM</h1>
          <p style="color: #9ca3af; margin: 8px 0 0 0; font-size: 14px;">Song Database Health Report • ${date}</p>
        </div>

        <!-- Overview Stats -->
        <div style="padding: 24px; border-bottom: 1px solid #e5e7eb;">
          <h2 style="margin: 0 0 16px 0; font-size: 18px; font-weight: 600; color: #111827;">Database Overview</h2>
          <div style="display: grid; grid-template-columns: repeat(2, 1fr); gap: 16px; text-align: center;">
            <div style="background-color: #f9fafb; padding: 16px; border-radius: 8px;">
              <div style="font-size: 24px; font-weight: 700; color: #4f46e5;">${totalSongs}</div>
              <div style="font-size: 12px; color: #6b7280; text-transform: uppercase; letter-spacing: 0.05em;">Total Songs</div>
            </div>
            <div style="background-color: #f9fafb; padding: 16px; border-radius: 8px;">
              <div style="font-size: 24px; font-weight: 700; color: #059669;">${coverage.chords}%</div>
              <div style="font-size: 12px; color: #6b7280; text-transform: uppercase; letter-spacing: 0.05em;">Completion Score</div>
            </div>
          </div>
        </div>

        <!-- Coverage Details -->
        <div style="padding: 24px;">
          <h2 style="margin: 0 0 16px 0; font-size: 18px; font-weight: 600; color: #111827;">Metadata Coverage</h2>
          
          ${renderProgressBar('Chords / Lyrics', coverage.chords, counts.withChords, coverage.chords < 50 ? '#ef4444' : '#4f46e5')}
          ${renderProgressBar('YouTube Links', coverage.youtube, counts.withYoutube, coverage.youtube < 50 ? '#ef4444' : '#4f46e5')}
          ${renderProgressBar('Ultimate Guitar Links', coverage.ultimateGuitar, counts.withUltimateGuitar, coverage.ultimateGuitar < 50 ? '#ef4444' : '#4f46e5')}
          ${renderProgressBar('Gallery Images', coverage.galleryImages, counts.withGalleryImages, coverage.galleryImages < 50 ? '#ef4444' : '#4f46e5')}
        </div>

        <!-- Action Items -->
        <div style="padding: 24px; background-color: #fff1f2; border-top: 1px solid #e5e7eb;">
          <h2 style="margin: 0 0 16px 0; font-size: 18px; font-weight: 600; color: #991b1b;">Action Items</h2>
          <p style="margin: 0 0 16px 0; font-size: 14px; color: #7f1d1d;">The following songs are missing key information. Click to edit.</p>
          
          ${renderMissingList('Missing Chords', missing.chords)}
          ${renderMissingList('Missing YouTube Links', missing.youtube)}
          ${renderMissingList('Missing Ultimate Guitar Links', missing.ultimateGuitar)}
        </div>

        <!-- Footer -->
        <div style="padding: 24px; background-color: #f9fafb; border-top: 1px solid #e5e7eb; text-align: center;">
          <a href="${process.env.NEXT_PUBLIC_APP_URL}/dashboard/songs" style="display: inline-block; background-color: #4f46e5; color: #ffffff; padding: 10px 20px; border-radius: 6px; text-decoration: none; font-weight: 500; font-size: 14px;">Go to Song Dashboard</a>
          <p style="margin: 16px 0 0 0; font-size: 12px; color: #9ca3af;">
            Sent automatically by Guitar CRM
          </p>
        </div>

      </div>
    </body>
    </html>
  `;
}
