'use server';

import { createClient } from '@/lib/supabase/server';
import { getGoogleOAuth2Client } from '@/lib/google';
import { google } from 'googleapis';

export async function getGoogleEvents() {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    throw new Error('Unauthorized');
  }

  const { data: integration, error } = await supabase
    .from('user_integrations')
    .select('*')
    .eq('user_id', user.id)
    .eq('provider', 'google')
    .single();

  if (error || !integration) {
    return null; // Not connected
  }

  const oauth2Client = getGoogleOAuth2Client();
  oauth2Client.setCredentials({
    access_token: integration.access_token,
    refresh_token: integration.refresh_token,
    expiry_date: integration.expires_at,
  });

  // Check if token is expired and refresh if necessary
  const now = Date.now();
  if (integration.expires_at && integration.expires_at < now) {
    try {
      const { credentials } = await oauth2Client.refreshAccessToken();

      await supabase
        .from('user_integrations')
        .update({
          access_token: credentials.access_token,
          expires_at: credentials.expiry_date,
          updated_at: new Date().toISOString(),
          ...(credentials.refresh_token && { refresh_token: credentials.refresh_token }),
        })
        .eq('user_id', user.id)
        .eq('provider', 'google');

      oauth2Client.setCredentials(credentials);
    } catch (refreshError) {
      console.error('Error refreshing access token:', refreshError);
      // If refresh fails, we might want to delete the integration or mark it as invalid
      // For now, we'll just throw
      throw new Error('Failed to refresh Google access token');
    }
  }

  const calendar = google.calendar({ version: 'v3', auth: oauth2Client });

  try {
    const response = await calendar.events.list({
      calendarId: 'primary',
      timeMin: new Date().toISOString(),
      maxResults: 10,
      singleEvents: true,
      orderBy: 'startTime',
    });

    return response.data.items;
  } catch (error) {
    console.error('Error fetching calendar events:', error);
    throw new Error('Failed to fetch calendar events');
  }
}
