import {
  getGoogleOAuth2Client,
  getGoogleAuthUrl,
  getGoogleClient,
  getCalendarEventsInRange,
} from '@/lib/google';
import { google } from 'googleapis';
import { createClient } from '@/lib/supabase/server';

// Mock dependencies
jest.mock('googleapis', () => {
  const mOAuth2Client = {
    generateAuthUrl: jest
      .fn()
      .mockReturnValue('https://accounts.google.com/o/oauth2/v2/auth?mock=true'),
    setCredentials: jest.fn(),
  };
  return {
    google: {
      auth: {
        OAuth2: jest.fn(() => mOAuth2Client),
      },
      calendar: jest.fn().mockReturnValue({
        events: {
          list: jest.fn(),
        },
      }),
    },
  };
});

jest.mock('@/lib/supabase/server', () => ({
  createClient: jest.fn(),
}));

describe('Google Library', () => {
  const OLD_ENV = process.env;

  beforeEach(() => {
    jest.clearAllMocks();
    process.env = { ...OLD_ENV };
    process.env.GOOGLE_CLIENT_ID = 'mock-client-id';
    process.env.GOOGLE_CLIENT_SECRET = 'mock-client-secret';
    process.env.GOOGLE_REDIRECT_URI = 'http://localhost:3000/api/oauth2/callback';
  });

  afterAll(() => {
    process.env = OLD_ENV;
  });

  describe('getGoogleOAuth2Client', () => {
    it('should create an OAuth2 client with correct credentials', () => {
      getGoogleOAuth2Client();
      expect(google.auth.OAuth2).toHaveBeenCalledWith(
        'mock-client-id',
        'mock-client-secret',
        'http://localhost:3000/api/oauth2/callback'
      );
    });

    it('should throw error if credentials are missing', () => {
      delete process.env.GOOGLE_CLIENT_ID;
      expect(() => getGoogleOAuth2Client()).toThrow('Missing Google OAuth2 credentials');
    });
  });

  describe('getGoogleAuthUrl', () => {
    it('should generate a valid auth URL', () => {
      const url = getGoogleAuthUrl();
      expect(url).toBe('https://accounts.google.com/o/oauth2/v2/auth?mock=true');

      // Get the mock instance to check generateAuthUrl arguments
      const mockOAuth2Client = (google.auth.OAuth2 as unknown as jest.Mock).mock.results[0].value;
      expect(mockOAuth2Client.generateAuthUrl).toHaveBeenCalledWith({
        access_type: 'offline',
        scope: [
          'https://www.googleapis.com/auth/calendar.readonly',
          'https://www.googleapis.com/auth/userinfo.email',
        ],
        prompt: 'consent',
      });
    });
  });

  describe('getGoogleClient', () => {
    it('should return an authenticated client when integration exists', async () => {
      const mockSupabase = {
        from: jest.fn().mockReturnThis(),
        select: jest.fn().mockReturnThis(),
        eq: jest.fn().mockReturnThis(),
        single: jest.fn().mockResolvedValue({
          data: {
            access_token: 'mock-access-token',
            refresh_token: 'mock-refresh-token',
            expires_at: 1234567890,
          },
          error: null,
        }),
      };
      (createClient as jest.Mock).mockResolvedValue(mockSupabase);

      const client = await getGoogleClient('user-123');

      expect(client.setCredentials).toHaveBeenCalledWith({
        access_token: 'mock-access-token',
        refresh_token: 'mock-refresh-token',
        expiry_date: 1234567890,
      });
    });

    it('should throw error when integration is not found', async () => {
      const mockSupabase = {
        from: jest.fn().mockReturnThis(),
        select: jest.fn().mockReturnThis(),
        eq: jest.fn().mockReturnThis(),
        single: jest.fn().mockResolvedValue({
          data: null,
          error: { message: 'Not found' },
        }),
      };
      (createClient as jest.Mock).mockResolvedValue(mockSupabase);

      await expect(getGoogleClient('user-123')).rejects.toThrow('Google integration not found');
    });
  });

  describe('getCalendarEventsInRange', () => {
    it('should fetch events from Google Calendar', async () => {
      // Mock getGoogleClient behavior internally since we can't easily mock the exported function within the same module
      // However, we can mock the dependencies it uses (Supabase) which we already did.

      const mockSupabase = {
        from: jest.fn().mockReturnThis(),
        select: jest.fn().mockReturnThis(),
        eq: jest.fn().mockReturnThis(),
        single: jest.fn().mockResolvedValue({
          data: {
            access_token: 'mock-access-token',
          },
          error: null,
        }),
      };
      (createClient as jest.Mock).mockResolvedValue(mockSupabase);

      const mockList = jest.fn().mockResolvedValue({
        data: {
          items: [{ id: 'event-1', summary: 'Lesson 1' }],
        },
      });

      (google.calendar as unknown as jest.Mock).mockReturnValue({
        events: {
          list: mockList,
        },
      });

      const startDate = new Date('2023-01-01');
      const endDate = new Date('2023-01-31');

      const events = await getCalendarEventsInRange('user-123', startDate, endDate);

      expect(events).toHaveLength(1);
      expect(events[0].id).toBe('event-1');
      expect(mockList).toHaveBeenCalledWith({
        calendarId: 'primary',
        timeMin: startDate.toISOString(),
        timeMax: endDate.toISOString(),
        singleEvents: true,
        orderBy: 'startTime',
      });
    });
  });
});
