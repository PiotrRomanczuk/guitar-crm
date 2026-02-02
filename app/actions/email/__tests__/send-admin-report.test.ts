/**
 * Admin Email Report Server Actions Tests
 *
 * Tests the admin email report functionality:
 * - sendAdminSongReport - Send song database statistics via email
 *
 * @see app/actions/email/send-admin-report.ts
 */

import { sendAdminSongReport } from '../send-admin-report';

// Mock song analytics
const mockGetSongDatabaseStatistics = jest.fn();

jest.mock('@/lib/services/song-analytics', () => ({
  getSongDatabaseStatistics: () => mockGetSongDatabaseStatistics(),
}));

// Mock email template
const mockGenerateAdminSongReportHtml = jest.fn();

jest.mock('@/lib/email/templates/admin-song-report', () => ({
  generateAdminSongReportHtml: (stats: any) => mockGenerateAdminSongReportHtml(stats),
}));

// Mock SMTP transporter
const mockSendMail = jest.fn();

jest.mock('@/lib/email/smtp-client', () => ({
  __esModule: true,
  default: {
    sendMail: (options: any) => mockSendMail(options),
  },
}));

describe('sendAdminSongReport', () => {
  const originalEnv = process.env.GMAIL_USER;

  beforeEach(() => {
    jest.clearAllMocks();
    process.env.GMAIL_USER = 'admin@example.com';
  });

  afterEach(() => {
    process.env.GMAIL_USER = originalEnv;
  });

  it('should successfully send admin report email', async () => {
    const mockStats = {
      totalSongs: 100,
      songsByDifficulty: { easy: 30, medium: 50, hard: 20 },
      averageStudentsPerSong: 3.5,
      topSongs: [
        { id: '1', title: 'Wonderwall', artist: 'Oasis', studentCount: 10 },
      ],
    };

    mockGetSongDatabaseStatistics.mockResolvedValue(mockStats);
    mockGenerateAdminSongReportHtml.mockReturnValue('<html>Report</html>');
    mockSendMail.mockResolvedValue({ messageId: 'msg-123' });

    const result = await sendAdminSongReport();

    expect(result.success).toBe(true);
    expect(result.messageId).toBe('msg-123');
    expect(mockGetSongDatabaseStatistics).toHaveBeenCalled();
    expect(mockGenerateAdminSongReportHtml).toHaveBeenCalledWith(mockStats);
    expect(mockSendMail).toHaveBeenCalledWith(
      expect.objectContaining({
        to: 'admin@example.com',
        subject: expect.stringContaining('Song Database Report'),
        html: '<html>Report</html>',
      })
    );
  });

  it('should handle missing GMAIL_USER env variable', async () => {
    delete process.env.GMAIL_USER;

    mockGetSongDatabaseStatistics.mockResolvedValue({
      totalSongs: 100,
    });
    mockGenerateAdminSongReportHtml.mockReturnValue('<html>Report</html>');

    const result = await sendAdminSongReport();

    expect(result.success).toBe(false);
    expect(result.error).toBe('GMAIL_USER environment variable is not set');
    expect(mockSendMail).not.toHaveBeenCalled();
  });

  it('should handle stats fetch failure', async () => {
    mockGetSongDatabaseStatistics.mockRejectedValue(new Error('Database connection failed'));

    const result = await sendAdminSongReport();

    expect(result.success).toBe(false);
    expect(result.error).toBe('Database connection failed');
    expect(mockSendMail).not.toHaveBeenCalled();
  });

  it('should handle email send failure', async () => {
    mockGetSongDatabaseStatistics.mockResolvedValue({
      totalSongs: 100,
    });
    mockGenerateAdminSongReportHtml.mockReturnValue('<html>Report</html>');
    mockSendMail.mockRejectedValue(new Error('SMTP connection failed'));

    const result = await sendAdminSongReport();

    expect(result.success).toBe(false);
    expect(result.error).toBe('SMTP connection failed');
  });

  it('should handle unknown error types', async () => {
    mockGetSongDatabaseStatistics.mockRejectedValue('String error');

    const result = await sendAdminSongReport();

    expect(result.success).toBe(false);
    expect(result.error).toBe('Unknown error');
  });

  it('should use current date in subject line', async () => {
    mockGetSongDatabaseStatistics.mockResolvedValue({
      totalSongs: 50,
    });
    mockGenerateAdminSongReportHtml.mockReturnValue('<html>Report</html>');
    mockSendMail.mockResolvedValue({ messageId: 'msg-456' });

    await sendAdminSongReport();

    expect(mockSendMail).toHaveBeenCalledWith(
      expect.objectContaining({
        subject: expect.stringMatching(/Song Database Report - \d{1,2}\/\d{1,2}\/\d{4}/),
      })
    );
  });
});
