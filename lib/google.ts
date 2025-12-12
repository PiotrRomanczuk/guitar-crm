import { google } from 'googleapis';
import { createClient } from '@/lib/supabase/server';
import crypto from 'crypto';

export const getGoogleOAuth2Client = () => {
  const clientId = process.env.GOOGLE_CLIENT_ID;
  const clientSecret = process.env.GOOGLE_CLIENT_SECRET;
  const redirectUri = process.env.GOOGLE_REDIRECT_URI;

  if (!clientId || !clientSecret || !redirectUri) {
    throw new Error('Missing Google OAuth2 credentials');
  }

  return new google.auth.OAuth2(clientId, clientSecret, redirectUri);
};

export const getGoogleAuthUrl = () => {
  const oauth2Client = getGoogleOAuth2Client();

  const scopes = [
    'https://www.googleapis.com/auth/calendar.readonly',
    'https://www.googleapis.com/auth/userinfo.email',
  ];

  return oauth2Client.generateAuthUrl({
    access_type: 'offline',
    scope: scopes,
    prompt: 'consent',
  });
};

export interface CalendarEvent {
  id: string;
  summary: string;
  description?: string;
  start: { dateTime: string; timeZone?: string };
  end: { dateTime: string; timeZone?: string };
  attendees?: Array<{ email: string; displayName?: string }>;
}

export const getGoogleClient = async (userId: string) => {
  const supabase = await createClient();
  const { data: integration, error } = await supabase
    .from('user_integrations')
    .select('*')
    .eq('user_id', userId)
    .eq('provider', 'google')
    .single();

  if (error || !integration) {
    throw new Error('Google integration not found');
  }

  const oauth2Client = getGoogleOAuth2Client();
  
  oauth2Client.setCredentials({
    access_token: integration.access_token,
    refresh_token: integration.refresh_token,
    expiry_date: integration.expires_at,
  });
  
  return oauth2Client;
};

export async function getCalendarEventsInRange(
  userId: string,
  startDate: Date,
  endDate: Date
): Promise<CalendarEvent[]> {
  const client = await getGoogleClient(userId);
  const calendar = google.calendar({ version: 'v3', auth: client });
  
  const response = await calendar.events.list({
    calendarId: 'primary',
    timeMin: startDate.toISOString(),
    timeMax: endDate.toISOString(),
    singleEvents: true,
    orderBy: 'startTime',
  });
  
  return (response.data.items || []) as CalendarEvent[];
}

export async function watchCalendar(userId: string, webhookUrl: string) {
  const client = await getGoogleClient(userId);
  const calendar = google.calendar({ version: 'v3', auth: client });
  
  const channelId = crypto.randomUUID();
  
  const response = await calendar.events.watch({
    calendarId: 'primary',
    requestBody: {
      id: channelId,
      type: 'web_hook',
      address: webhookUrl,
    },
  });
  
  return {
    channelId: response.data.id,
    resourceId: response.data.resourceId,
    expiration: response.data.expiration ? parseInt(response.data.expiration) : undefined,
  };
}
